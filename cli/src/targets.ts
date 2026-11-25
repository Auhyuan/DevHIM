import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join, resolve } from "node:path";

import type { Snapshot } from "./source.js";

export type Scope = "project" | "global";
export type Mode = "skill" | "plugin";

export const home = resolve(homedir());
const claudeHome = resolve(process.env.CLAUDE_CONFIG_DIR || join(home, ".claude"));
const codexHome = resolve(process.env.CODEX_HOME || join(home, ".codex"));

export const tools = {
  codex: {
    label: "Codex", projectDir: ".agents/skills", userDir: join(home, ".agents/skills"),
    anchor: home, signal: ".codex", command: "codex", plugin: true, entry: "$p-sop",
  },
  claude: {
    label: "Claude Code", projectDir: ".claude/skills", userDir: join(claudeHome, "skills"),
    anchor: claudeHome, signal: ".claude", command: "claude", plugin: true, entry: "/p-sop",
  },
  cursor: {
    label: "Cursor", projectDir: ".cursor/skills", userDir: join(home, ".cursor/skills"),
    anchor: home, signal: ".cursor", command: "cursor", plugin: false, entry: "在 Agent 中选择 p-sop",
  },
  qoder: {
    label: "Qoder", projectDir: ".qoder/skills", userDir: join(home, ".qoder/skills"),
    anchor: home, signal: ".qoder", command: "qoder", plugin: false, entry: "在 Agent 中选择 p-sop",
  },
  opencode: {
    label: "OpenCode", projectDir: ".opencode/skills",
    userDir: join(resolve(process.env.XDG_CONFIG_HOME || join(home, ".config")), "opencode/skills"),
    anchor: resolve(process.env.XDG_CONFIG_HOME || join(home, ".config")),
    signal: ".opencode", command: "opencode", plugin: false, entry: "@p-sop",
  },
} as const;

export type Tool = keyof typeof tools;
export const toolIds = Object.keys(tools) as Tool[];

export interface Selection {
  scope: Scope;
  mode: Mode;
  project: string;
  tools: Tool[];
}

export interface NativeAction {
  cwd: string;
  command: string;
  args: string[];
}

export interface Target {
  tool: Tool;
  anchor: string;
  bundle: string;
  files: [path: string, content: Buffer][];
  catalog?: { path: string; name: string; pluginPath: string };
  native: NativeAction[];
  result: "Skill 文件已就绪" | "插件已安装" | "已登记，待启用";
  entry: string;
}

function skillPrefix(tool: Tool, { scope, project }: Selection): string {
  return scope === "project" ? join(project, tools[tool].projectDir) : tools[tool].userDir;
}

function pluginLocation(tool: Tool, { scope, project }: Selection) {
  if (tool === "claude") {
    const root = join(claudeHome, "devhim/marketplace");
    return { root, anchor: claudeHome, bundle: join(root, "plugins/devhim"), pluginPath: "./plugins/devhim" };
  }
  const root = scope === "project" ? project : join(codexHome, "devhim/marketplace");
  const pluginPath = scope === "project" ? ".agents/plugins/devhim" : "plugins/devhim";
  return {
    root, anchor: scope === "project" ? project : codexHome,
    bundle: join(root, pluginPath), pluginPath: "./" + pluginPath,
  };
}

export function encodeJson(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(value, null, 2) + "\n");
}

export function buildTargets(selection: Selection, snapshot: Snapshot, updating: boolean): Target[] {
  const { mode, scope, project } = selection;
  const content = snapshot.skills;
  return selection.tools.map((tool): Target => {
    const host = tools[tool];
    if (mode === "skill") {
      const bundle = join(skillPrefix(tool, selection), "p-sop");
      return {
        tool, anchor: scope === "project" ? project : host.anchor, bundle,
        files: content[0].files.map(([name, body]) => [join(bundle, name), body]),
        native: [], result: "Skill 文件已就绪", entry: "打开新会话后使用 " + host.entry,
      };
    }
    if (!host.plugin) throw new Error(host.label + " 尚未适配 DevHIM 插件。");

    const { root, anchor, bundle, pluginPath } = pluginLocation(tool, selection);
    const files: Target["files"] = content.flatMap(({ name, files }) =>
      files.map(([file, body]): [string, Buffer] => [join(bundle, "skills", name, file), body]));
    const manifest = {
      name: "devhim", version: snapshot.version,
      description: "P-SOP 项目开发规范、需求探索、需求分析与交付、项目价值评估。",
    };

    if (tool === "claude") {
      const nativeScope = scope === "project" ? "local" : "user";
      files.push([join(bundle, ".claude-plugin/plugin.json"), encodeJson(manifest)]);
      files.push([join(root, ".claude-plugin/marketplace.json"), encodeJson({
        name: "devhim-local", owner: { name: "Auhyuan" },
        plugins: [{ ...manifest, source: pluginPath }],
      })]);
      return {
        tool, anchor, bundle, files,
        native: [
          { cwd: scope === "project" ? project : root, command: "claude",
            args: updating ? ["plugin", "marketplace", "update", "devhim-local"]
              : ["plugin", "marketplace", "add", "--scope", nativeScope, root] },
          { cwd: scope === "project" ? project : root, command: "claude",
            args: ["plugin", updating ? "update" : "install", "--scope", nativeScope, "devhim@devhim-local"] },
        ],
        result: "插件已安装",
        entry: "新会话中使用 " + content.map(({ name }) => "/devhim:" + name).join("、"),
      };
    }

    files.push([join(bundle, ".codex-plugin/plugin.json"), encodeJson({
      ...manifest, skills: "./skills/", interface: { displayName: "DevHIM" },
    })]);
    const name = scope === "project" ? "devhim-project" : "devhim-local";
    return {
      tool, anchor, bundle, files,
      catalog: { path: join(root, ".agents/plugins/marketplace.json"), name, pluginPath },
      native: scope === "project" ? [] : [
        ...(updating ? [] : [{ cwd: root, command: "codex", args: ["plugin", "marketplace", "add", root] }]),
        { cwd: root, command: "codex", args: ["plugin", "add", "devhim@" + name] },
      ],
      result: scope === "project" ? "已登记，待启用" : "插件已安装",
      entry: scope === "project"
        ? "在 Codex 打开此项目，从项目插件目录启用 DevHIM"
        : "打开新会话，从 DevHIM 插件中选择 Skill",
    };
  });
}

async function accessible(path: string, mode = constants.F_OK): Promise<boolean> {
  return access(path, mode).then(() => true, () => false);
}

export async function commandExists(command: string): Promise<boolean> {
  const windows = process.platform === "win32";
  const names = windows ? [command + ".exe", command + ".cmd", command + ".bat"] : [command];
  const paths = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  const checks = paths.flatMap((root) => names.map((name) =>
    accessible(join(root, name), windows ? constants.F_OK : constants.X_OK)));
  return (await Promise.all(checks)).some(Boolean);
}

export async function detectTool(tool: Tool, selection: Selection) {
  const host = tools[tool];
  const skill = selection.mode === "skill"
    ? join(skillPrefix(tool, selection), "p-sop/SKILL.md")
    : join(pluginLocation(tool, selection).bundle, "skills/p-sop/SKILL.md");
  const configured = await accessible(skill);
  const detected = configured || await accessible(join(home, host.signal))
    || (selection.scope === "project" && await accessible(join(selection.project, host.signal)))
    || await commandExists(host.command);
  return { configured, detected };
}
