import { lstat, open, unlink } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { zipSync } from "fflate";
import { codexManifest, encodeJson, pluginManifest } from "./targets.js";
import type { Snapshot } from "./source.js";

export async function exportPlugin(snapshot: Snapshot, dryRun: boolean): Promise<void> {
  const path = resolve("devhim-plugin-" + snapshot.version + ".zip");
  console.log("插件来源  " + snapshot.source + " · " + snapshot.version + (snapshot.commit ? " @ " + snapshot.commit : ""));
  console.log("输出路径  " + path);
  const collision = "已有同名文件，请选择其他目录或移走旧文件：" + path;
  const existing = await lstat(path).catch(error => {
    if (error.code !== "ENOENT") throw error;
    return undefined;
  });
  if (existing) throw new Error(collision);
  if (dryRun) return;

  const manifest = pluginManifest(snapshot);
  const files: Record<string, Uint8Array> = {
    "plugin.json": encodeJson({ $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json", ...manifest }),
    ".codex-plugin/plugin.json": encodeJson(codexManifest(snapshot)),
    ".claude-plugin/plugin.json": encodeJson(manifest),
  };
  for (const skill of snapshot.skills) {
    for (const [file, content] of skill.files) {
      files["skills/" + skill.name + "/" + file.split(sep).join("/")] = content;
    }
  }
  const data = zipSync(files);
  const output = await open(path, "wx").catch(error => {
    if (error.code === "EEXIST") throw new Error(collision);
    throw error;
  });
  try {
    try {
      await output.writeFile(data);
    } finally {
      await output.close();
    }
  } catch (error) {
    await unlink(path);
    throw error;
  }

  console.log("已导出 ZIP。请将该文件附给 Agent，并发送：");
  console.log("请查看这个 DevHIM 插件包，根据当前 Agent 支持的方式安装到本项目，保留已有配置，并告诉我如何启用和调用其中的 Skill。");
}
