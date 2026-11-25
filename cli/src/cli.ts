#!/usr/bin/env node
import { realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { styleText } from "node:util";
import * as prompt from "@clack/prompts";
import { Command, Option } from "commander";
import { applyPlan, createPlan, errorMessage, type InstallPlan } from "./install.js";
import { detectTool, home, tools, toolIds, type Mode, type Scope, type Selection, type Tool } from "./targets.js";

import { cliVersion, loadSnapshot, type Snapshot } from "./source.js";

interface InitOptions {
  scope?: Scope;
  mode?: Mode;
  tools?: string;
  dryRun?: boolean;
  offline?: boolean;
}

class Cancelled extends Error {}

async function answer<T>(question: Promise<T | typeof prompt.CANCEL_SYMBOL>): Promise<T> {
  const result = await question;
  if (prompt.isCancel(result)) throw new Cancelled();
  return result;
}

const scopes = { project: "当前项目", global: "用户全局" };
const modes = { skill: "独立 P-SOP Skill", plugin: "DevHIM 插件" };
const actions = {
  add: { label: "新增", color: "green" },
  update: { label: "更新", color: "cyan" },
  remove: { label: "移除旧文件", color: "yellow" },
  same: { label: "已一致", color: "dim" },
  conflict: { label: "冲突", color: "red" },
} as const;

const automatedExample = "devhim init --scope project --mode skill --tools codex,claude";

function parseTools(input: string): Tool[] {
  return [...new Set(input.split(",").map((value) => {
    const id = value.trim().toLowerCase();
    const tool = toolIds.find((candidate) => candidate === id);
    if (!tool) throw new Error("无法识别 Agent「" + id + "」。可选值：" + toolIds.join(", "));
    return tool;
  }))];
}

async function pickTools(selection: Selection, updating: boolean): Promise<Tool[]> {
  const available = toolIds.filter((id) => selection.mode === "skill" || tools[id].plugin);
  const candidates = await Promise.all(available.map(async (id) => ({
    id, ...await detectTool(id, selection),
  })));
  candidates.sort((a, b) => Number(b.configured) - Number(a.configured) || Number(b.detected) - Number(a.detected));
  const selectable = updating ? candidates.filter(candidate => candidate.configured) : candidates;
  if (!selectable.length) throw new Error("当前范围没有已安装的目标，请先运行 init。");
  const options = selectable.map(({ id, configured, detected }) => ({
    value: id,
    label: tools[id].label,
    hint: configured ? "已有 DevHIM 文件" : detected ? "已检测到" : undefined,
  }));

  return answer(prompt.autocompleteMultiselect({
    message: updating ? "选择要更新的 Agent" : "选择要安装的 Agent",
    placeholder: "输入名称筛选",
    options,
    required: true,
    initialValues: candidates.filter(({ configured }) => configured).map(({ id }) => id),
    filter: (query, option) => (option.label + " " + option.value).toLowerCase().includes(query.toLowerCase()),
  }));
}

function subpath(base: string, file: string): string | undefined {
  const rel = relative(base, file);
  if (isAbsolute(rel) || rel === ".." || rel.startsWith(".." + sep)) return;
  return rel;
}

function readablePath(selection: Selection, file: string): string {
  const fromProject = selection.scope === "project" ? subpath(selection.project, file) : undefined;
  if (fromProject) return "." + sep + fromProject;
  const fromHome = subpath(home, file);
  return fromHome ? "~" + sep + fromHome : file;
}

function renderPlan(selection: Selection, plans: InstallPlan[], showUnchanged: boolean, snapshot: Snapshot, updating: boolean): void {
  console.log("\n" + styleText("bold", updating ? "更新计划" : "安装计划") + "   " + scopes[selection.scope] + " / " + modes[selection.mode]);
  console.log("目标版本  " + snapshot.source + " · " + snapshot.version + (snapshot.commit ? " @ " + snapshot.commit : ""));
  if (selection.scope === "project") console.log("项目路径  " + selection.project);
  for (const plan of plans) {
    const title = tools[plan.target.tool].label;
    const counts = { add: 0, update: 0, remove: 0, same: 0, conflict: 0 };
    for (const step of plan.files) counts[step.action]++;
    const summary = (Object.keys(actions) as (keyof typeof actions)[])
      .filter((action) => counts[action] > 0)
      .map((action) => counts[action] + " " + actions[action].label);
    console.log("\n" + styleText("bold", title) + "   " + summary.join(" · "));
    if (plan.previous) console.log("  当前版本  " + plan.previous);
    for (const step of plan.files) {
      if (step.action === "same" && !showUnchanged) continue;
      const { label, color } = actions[step.action];
      console.log("  " + styleText(color, label) + "  " + readablePath(selection, step.path));
      if (step.reason) console.log("        " + step.reason);
    }
    if (plan.reason) console.log("  " + styleText("red", plan.reason));
    if (plan.blocked) {
      console.log("  此 Agent 有冲突，安装时将跳过。");
    } else if (plan.target.native.length) {
      const nativeScope = plan.target.tool === "claude" ? "（" + scopes[selection.scope] + "）" : "";
      console.log("  原生安装  交给 " + title + " 注册并启用插件" + nativeScope);
    } else if (plan.target.result === "已登记，待启用") {
      console.log("  手动启用  " + plan.target.entry);
    }
  }
  console.log();
}

async function run(path: string | undefined, options: InitOptions, updating: boolean): Promise<void> {
  const needsChoices = !options.scope || !options.mode || !options.tools;
  if (needsChoices && !(process.stdin.isTTY && process.stdout.isTTY && !process.env.CI)) {
    throw new Error("脚本环境请明确指定安装选项。例如 " + automatedExample);
  }
  const chosen = options.tools === undefined ? undefined : parseTools(options.tools);
  if (needsChoices) prompt.intro(updating ? "DevHIM  ·  更新向导" : "DevHIM  ·  安装向导");

  const scope = options.scope ?? await answer(prompt.select<Scope>({
    message: updating ? "更新哪个范围？" : "安装到哪里？",
    options: [
      { value: "project", label: scopes.project, hint: "仅此项目" },
      { value: "global", label: scopes.global, hint: "当前用户的所有项目" },
    ],
  }));
  if (scope === "global" && path !== undefined) throw new Error("全局安装请省略项目目录参数。");
  const requested = resolve(path ?? process.cwd());
  let project = requested;
  if (scope === "project") {
    project = await realpath(requested).catch(() => {
      throw new Error("无法访问项目目录：" + requested);
    });
    if (!(await stat(project)).isDirectory()) throw new Error("项目路径不是目录：" + project);
  }

  const mode = options.mode ?? await answer(prompt.select<Mode>({
    message: updating ? "要更新什么？" : "要安装什么？",
    options: [
      { value: "skill", label: modes.skill, hint: "完整项目 SOP 与看板" },
      { value: "plugin", label: modes.plugin, hint: "P-SOP、Brainstorming、需求助手、项目评估" },
    ],
  }));
  const selection: Selection = { scope, mode, project, tools: [] };
  selection.tools = chosen ?? await pickTools(selection, updating);
  if (mode === "plugin" && selection.tools.some(id => !tools[id].plugin)) throw new Error("插件模式仅支持 Codex 和 Claude Code。");
  const snapshot = await loadSnapshot(mode, options.offline === true);
  const plans = await createPlan(selection, snapshot, updating);
  renderPlan(selection, plans, options.dryRun === true, snapshot, updating);

  if (options.dryRun) {
    console.log("预览结束。执行安装时省略 --dry-run。");
    return;
  }

  const eligible = plans.filter((plan) => !plan.blocked);
  if (!eligible.length) {
    console.log("请处理上述冲突后重试。");
    process.exitCode = 1;
    return;
  }
  if (needsChoices && !await answer(prompt.confirm({ message: "执行以上可安装项目？", initialValue: false }))) {
    throw new Cancelled();
  }

  console.log("安装结果");
  let failures = 0;
  for (const plan of plans) {
    const label = tools[plan.target.tool].label;
    if (plan.blocked) {
      failures++;
      console.log("  " + label + "  已跳过 · 见安装计划");
      continue;
    }
    try {
      await applyPlan(plan);
      console.log("  " + label + "  " + plan.target.result);
      console.log("    " + plan.target.entry);
    } catch (error) {
      failures++;
      console.error("  " + label + "  安装失败 · " + errorMessage(error));
    }
  }
  if (failures > 0) process.exitCode = 1;
}

const program = new Command()
  .name("devhim")
  .description("为 Agent 安装 P-SOP 或 DevHIM 插件")
  .version(cliVersion, "-V, --version", "查看版本")
  .helpOption("-h, --help", "查看帮助")
  .showHelpAfterError();

for (const name of ["init", "update"] as const) {
  program.command(name + " [path]")
    .description(name === "init" ? "安装独立 Skill 或 DevHIM 插件" : "更新已安装的目标并保留本地修改")
    .addOption(new Option("--scope <scope>", "安装范围").choices(["project", "global"]))
    .addOption(new Option("--mode <mode>", "独立 Skill 或组合插件").choices(["skill", "plugin"]))
    .option("--tools <ids>", "Agent ID，逗号分隔：" + toolIds.join(", "))
    .option("--dry-run", "逐文件预览，不写入文件")
    .option("--offline", "使用当前 CLI 随附的 Skill 快照")
    .addHelpText("after", "\n示例\n  devhim " + name + "\n  " + automatedExample.replace("init", name) + " --dry-run")
    .action((path, options) => run(path, options, name === "update"));
}

try {
  if (process.argv.length === 2) program.outputHelp();
  else await program.parseAsync();
} catch (error) {
  if (error instanceof Cancelled) prompt.cancel("已取消安装。");
  else {
    console.error("DevHIM · " + errorMessage(error));
    process.exitCode = 1;
  }
}
