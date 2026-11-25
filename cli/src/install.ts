import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { chmod, link, lstat, mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, sep } from "node:path";
import { buildTargets, commandExists, encodeJson, type Selection, type Target } from "./targets.js";

import { loadSnapshot, type Snapshot } from "./source.js";

type FileAction = "add" | "same" | "update" | "remove" | "conflict";

interface FileStep {
  path: string;
  action: FileAction;
  before?: Buffer;
  after?: Buffer;
  reason?: string;
}

export interface InstallPlan {
  target: Target;
  files: FileStep[];
  previous?: string;
  blocked: boolean;
  reason?: string;
}

function isErrno(error: unknown, code: string): boolean {
  return (error as NodeJS.ErrnoException).code === code;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function getStat(path: string) {
  try {
    return await lstat(path);
  } catch (error) {
    if (!isErrno(error, "ENOENT")) throw error;
  }
}

async function readDestination(anchor: string, file: string): Promise<Buffer | undefined> {
  const path = relative(anchor, file);
  const parts = path.split(sep);
  if (isAbsolute(path) || !path || parts[0] === "..") {
    throw new Error("目标超出安装范围");
  }

  let current = anchor;
  for (const part of parts.slice(0, -1)) {
    current = join(current, part);
    const stat = await getStat(current);
    if (!stat) return undefined;
    if (!stat.isDirectory()) throw new Error("父路径是符号链接或普通文件：" + current);
  }

  const stat = await getStat(file);
  if (!stat) return undefined;
  if (!stat.isFile()) throw new Error("目标是目录、符号链接或特殊文件");
  return readFile(file);
}

function catalogContent(catalog: NonNullable<Target["catalog"]>, before?: Buffer): Buffer {
  const entry = {
    name: "devhim",
    source: { source: "local", path: catalog.pluginPath },
    policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
    category: "Productivity",
  };
  if (!before) return encodeJson({
    name: catalog.name, interface: { displayName: "DevHIM 本地插件" }, plugins: [entry],
  });

  let parsed: { name?: unknown; plugins?: unknown };
  try {
    parsed = JSON.parse(before.toString("utf8"));
  } catch {
    throw new Error("现有插件目录配置不是有效的 JSON");
  }
  if (!parsed || typeof parsed.name !== "string" || !Array.isArray(parsed.plugins)) {
    throw new Error("现有文件不是有效的 Codex 插件目录配置");
  }
  if (catalog.name === "devhim-local" && parsed.name !== catalog.name) {
    throw new Error("DevHIM 的全局插件目录名称与注册命令不匹配");
  }
  const existing = parsed.plugins.find((plugin) => plugin?.name === entry.name);
  if (existing) {
    if (existing.source?.source === "local" && existing.source?.path === catalog.pluginPath) return before;
    throw new Error("现有插件目录中已包含指向其他位置的 DevHIM");
  }
  return encodeJson({ ...parsed, plugins: [...parsed.plugins, entry] });
}

async function planFile(
  target: Target, path: string, desired: (before?: Buffer) => Buffer, allowUpdate = false,
): Promise<FileStep> {
  try {
    const before = await readDestination(target.anchor, path);
    const after = desired(before);
    if (!before) return { path, action: "add", after };
    if (before.equals(after)) return { path, action: "same", before };
    if (allowUpdate) return { path, action: "update", before, after };
    return { path, action: "conflict", reason: "现有文件内容不同，予以保留" };
  } catch (error) {
    return { path, action: "conflict", reason: errorMessage(error) };
  }
}

type Receipt = Pick<Snapshot, "source" | "version" | "commit"> & { schema: 1; files: Record<string, string> };

function hash(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

function receiptPath(target: Target): string {
  return join(dirname(target.bundle), "." + basename(target.bundle) + ".devhim-install.json");
}

function fileKey(target: Target, path: string): string {
  const rel = relative(target.bundle, path).split(sep).join("/");
  if (!rel.startsWith("../")) return "bundle/" + rel;
  if (target.tool === "claude" && path === join(target.bundle, "../../.claude-plugin/marketplace.json")) return "marketplace";
  throw new Error("无法记录目标文件：" + path);
}

function receiptFile(target: Target, key: string): string {
  if (key === "marketplace" && target.tool === "claude" && target.native.length) {
    return join(target.bundle, "../../.claude-plugin/marketplace.json");
  }
  const [prefix, ...parts] = key.split("/");
  if (prefix !== "bundle" || !parts.length || parts.some(p => !p || p === "." || p === ".." || p === ".git" || /[\\:\x00-\x1f]/.test(p))) {
    throw new Error("安装记录包含无效路径：" + key);
  }
  return join(target.bundle, ...parts);
}

function parseReceipt(target: Target, data: Buffer): Receipt {
  const receipt = JSON.parse(data.toString("utf8")) as Receipt;
  if (receipt?.schema !== 1 || typeof receipt.version !== "string" || typeof receipt.source !== "string"
      || !receipt.files || typeof receipt.files !== "object" || Array.isArray(receipt.files)) {
    throw new Error("无法识别安装记录");
  }
  for (const [key, digest] of Object.entries(receipt.files)) {
    receiptFile(target, key);
    if (typeof digest !== "string" || !/^[0-9a-f]{64}$/.test(digest)) throw new Error("安装记录中的文件指纹无效");
  }
  return receipt;
}

function receiptLabel(receipt: Receipt): string {
  return receipt.source + " · " + receipt.version + (receipt.commit ? " @ " + receipt.commit : "");
}

async function planManagedFiles(target: Target, baseline: Record<string, string>, updating: boolean, managed: boolean) {
  const files: FileStep[] = [];
  const hashes: Record<string, string> = {};
  for (const [path, after] of target.files) {
    const key = fileKey(target, path);
    hashes[key] = hash(after);
    const before = await readDestination(target.anchor, path);
    const expected = baseline[key];
    if (before?.equals(after)) files.push({ path, action: "same", before });
    else if (!before && !expected) files.push({ path, action: "add", after });
    else if (updating && before && expected === hash(before)) files.push({ path, action: "update", before, after });
    else files.push({ path, action: "conflict", reason: "现有内容与安装基线不同，保留本地状态" });
  }
  for (const key of Object.keys(baseline)) {
    if (key in hashes) continue;
    const path = receiptFile(target, key);
    const before = await readDestination(target.anchor, path);
    if (!before) continue;
    if (managed && updating && hash(before) === baseline[key]) files.push({ path, action: "remove", before });
    else files.push({ path, action: "conflict", reason: "新版已移除此文件，无法安全清理本地副本" });
  }
  return { files, hashes };
}

export async function createPlan(selection: Selection, snapshot: Snapshot, updating: boolean): Promise<InstallPlan[]> {
  const targets = buildTargets(selection, snapshot, updating);
  let bundledTargets: Promise<Target[]> | undefined;
  return Promise.all(targets.map(async (target, index): Promise<InstallPlan> => {
    try {
      const record = receiptPath(target);
      const raw = await readDestination(target.anchor, record);
      const prior = raw ? parseReceipt(target, raw) : undefined;
      let baseline = prior?.files ?? {};
      if (updating && !prior) {
        const entry = selection.mode === "skill" ? "SKILL.md" : join("skills", "p-sop", "SKILL.md");
        if (!await readDestination(target.anchor, join(target.bundle, entry))) throw new Error("此目标尚未安装，请先运行 init");
        bundledTargets ??= loadSnapshot(selection.mode, true).then(local => buildTargets(selection, local, false));
        const bundled = (await bundledTargets)[index];
        baseline = Object.fromEntries(bundled.files.map(([path, body]) => [fileKey(target, path), hash(body)]));
      }
      const { files, hashes } = await planManagedFiles(target, baseline, updating, Boolean(prior));
      if (target.catalog) {
        const catalog = target.catalog;
        files.push(await planFile(target, catalog.path, before => catalogContent(catalog, before), true));
      }
      const { source, version, commit } = snapshot;
      const receipt: Receipt = { schema: 1, source, version, commit, files: hashes };
      const after = encodeJson(receipt);
      if (!raw) files.push({ path: record, action: "add", after });
      else if (raw.equals(after)) files.push({ path: record, action: "same", before: raw });
      else if (updating) files.push({ path: record, action: "update", before: raw, after });
      else files.push({ path: record, action: "conflict", reason: "已有不同版本的安装记录，请使用 update" });
      const native = target.native[0];
      const reason = native && !await commandExists(native.command)
        ? "PATH 上找不到 " + native.command + "，请先安装它的 CLI" : undefined;
      const previous = prior ? receiptLabel(prior) : updating ? "旧安装（版本未知，按内置指纹识别）" : undefined;
      return { target, files, reason, previous, blocked: Boolean(reason) || files.some(step => step.action === "conflict") };
    } catch (error) {
      return { target, files: [], reason: errorMessage(error), blocked: true };
    }
  }));
}

async function assertUnchanged(anchor: string, step: FileStep): Promise<void> {
  const current = await readDestination(anchor, step.path);
  const unchanged = step.before ? current?.equals(step.before) : current === undefined;
  if (!unchanged) throw new Error("预览后文件发生变化，请重新预览：" + step.path);
}

async function writeStep(anchor: string, step: FileStep): Promise<void> {
  if (step.action === "remove") {
    await assertUnchanged(anchor, step);
    await unlink(step.path);
    return;
  }
  if (!step.after) return;
  const parent = dirname(step.path);
  await mkdir(parent, { recursive: true });
  const temporary = join(parent, "." + basename(step.path) + ".devhim-" + randomUUID());
  const mode = step.action === "update" ? (await lstat(step.path)).mode & 0o777 : undefined;
  try {
    await writeFile(temporary, step.after, { flag: "wx", mode });
    if (mode !== undefined) await chmod(temporary, mode);
    await assertUnchanged(anchor, step);
    if (step.action === "add") await link(temporary, step.path);
    else await rename(temporary, step.path);
  } finally {
    await unlink(temporary).catch((error) => {
      if (!isErrno(error, "ENOENT")) throw error;
    });
  }
}

export async function applyPlan(plan: InstallPlan): Promise<void> {
  if (plan.blocked) throw new Error("当前安装计划有冲突");
  const lock = receiptPath(plan.target) + ".lock";
  await readDestination(plan.target.anchor, lock);
  await mkdir(dirname(lock), { recursive: true });
  try {
    await writeFile(lock, String(process.pid), { flag: "wx" });
  } catch (error) {
    if (isErrno(error, "EEXIST")) throw new Error("目标正在安装。若上一次进程已退出，可移除遗留锁：" + lock);
    throw error;
  }
  try {
    await applyLocked(plan);
  } finally {
    await unlink(lock);
  }
}

async function applyLocked(plan: InstallPlan): Promise<void> {
  for (const step of plan.files) await assertUnchanged(plan.target.anchor, step);
  for (const step of plan.files) await writeStep(plan.target.anchor, step);

  for (const { command, args, cwd } of plan.target.native) {
    const result = spawnSync(command, args, { cwd, stdio: "inherit", windowsHide: true });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(command + " " + args.slice(0, 3).join(" ") + " 未完成。安装文件已写入，修正后可重试。");
    }
  }
}
