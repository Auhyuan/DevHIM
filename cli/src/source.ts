import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

export type SkillFile = [path: string, body: Buffer];
export interface Snapshot {
  source: string;
  version: string;
  commit?: string;
  skills: { name: string; files: SkillFile[] }[];
}

export const cliVersion: string = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")).version;
const bundledRoot = new URL("../skill/career/", import.meta.url);
const repository = "https://api.github.com/repos/Auhyuan/DevHIM";
const catalog = [
  { name: "p-sop", folder: "P-SOP" },
  { name: "requirement-helper", folder: "requirement-helper" },
  { name: "project-evaluation", folder: "project-evaluation" },
  { name: "brainstorming", folder: "brainstorming" },
];

async function localFiles(root: URL, prefix = ""): Promise<SkillFile[]> {
  const files: SkillFile[] = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === ".DS_Store") continue;
    const path = join(prefix, entry.name);
    const child = new URL(encodeURIComponent(entry.name) + (entry.isDirectory() ? "/" : ""), root);
    if (entry.isDirectory()) files.push(...await localFiles(child, path));
    else if (entry.isFile()) files.push([path, await readFile(child)]);
    else throw new Error("不支持的文件：" + path);
  }
  return files;
}

async function github<T>(path: string): Promise<T> {
  const response = await fetch(repository + path, {
    headers: { Accept: "application/vnd.github+json", "User-Agent": "devhim-cli" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error("GitHub HTTP " + response.status + " · " + path.split("?")[0]);
  return await response.json() as T;
}

interface Release { tag: string; version: string; commit: string }
async function latestStable(): Promise<Release> {
  let latest: Release | undefined;
  const stable = /^v?((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/;
  for (let page = 1; ; page++) {
    const tags = await github<{ name: string; commit: { sha: string } }[]>("/tags?per_page=100&page=" + page);
    for (const tag of tags) {
      const match = stable.exec(tag.name);
      if (!match) continue;
      const value = match[1];
      if (!latest || value.localeCompare(latest.version, "en", { numeric: true }) > 0) {
        latest = { version: value, tag: tag.name, commit: tag.commit.sha };
      }
    }
    if (tags.length < 100) break;
  }
  if (!latest) throw new Error("官方仓库尚无稳定版本标签（例如 v1.0.0）");
  if (!/^[0-9a-f]{40}$/.test(latest.commit)) throw new Error("无效的提交标识");
  return latest;
}

interface TreeEntry { path: string; type: string; mode: string; sha: string }
async function remoteFiles(entries: TreeEntry[], folder: string, commit: string): Promise<SkillFile[]> {
  const prefix = "skill/career/" + folder + "/";
  const selected = entries.filter((entry) => entry.path.startsWith(prefix) && entry.type !== "tree");
  const files: SkillFile[] = [];
  for (const entry of selected) {
    const path = entry.path.slice(prefix.length);
    if (path.split("/").some((part) => !part || part === "." || part === ".." || /[\\:\x00-\x1f]/.test(part))
        || !/^100(644|755)$/.test(entry.mode) || entry.type !== "blob" || !/^[0-9a-f]{40}$/.test(entry.sha)) {
      throw new Error("不支持的仓库文件：" + entry.path);
    }
    if (path.split("/").includes(".DS_Store")) continue;
    const url = "https://raw.githubusercontent.com/Auhyuan/DevHIM/" + commit + "/"
      + entry.path.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error("读取文件失败：" + path + " (HTTP " + response.status + ")");
    const body = Buffer.from(await response.arrayBuffer());
    const digest = createHash("sha1").update("blob " + body.length + "\0").update(body).digest("hex");
    if (digest !== entry.sha) throw new Error("文件校验失败：" + path);
    files.push([path, body]);
  }
  return files;
}

export async function loadSnapshot(mode: "skill" | "plugin", offline: boolean): Promise<Snapshot> {
  const wanted = mode === "skill" ? catalog.slice(0, 1) : catalog;
  try {
    const release = offline ? undefined : await latestStable();
    const tree = release ? await github<{ tree: TreeEntry[]; truncated: boolean }>(
      "/git/trees/" + release.commit + "?recursive=1",
    ) : undefined;
    if (tree?.truncated) throw new Error("仓库文件树不完整");
    const skills = await Promise.all(wanted.map(async ({ name, folder }) => {
      const files = release && tree ? await remoteFiles(tree.tree, folder, release.commit) : await localFiles(new URL(folder + "/", bundledRoot));
      if (!files.some(([path]) => path === "SKILL.md")) throw new Error(folder + "/SKILL.md 缺失");
      return { name, files };
    }));
    return { source: release ? "GitHub " + release.tag : "npm 内置快照", version: release?.version ?? cliVersion,
      commit: release?.commit, skills };
  } catch (error) {
    if (offline) throw error;
    throw new Error("获取稳定版失败：" + (error instanceof Error ? error.message : String(error))
      + "。可重试，或明确指定 --offline 使用内置快照。");
  }
}
