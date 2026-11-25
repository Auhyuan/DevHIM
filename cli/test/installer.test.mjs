import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { applyPlan, createPlan } from "../../dist/install.js";
import { loadSnapshot } from "../../dist/source.js";

const sha = "a".repeat(40);
const content = Buffer.from("# P-SOP\n");
const blob = createHash("sha1").update("blob " + content.length + "\0").update(content).digest("hex");
const entry = { path: "skill/career/P-SOP/SKILL.md", mode: "100644", type: "blob", sha: blob };

test("selects the highest stable tag and reads the correct blob from that commit", async t => {
  const versions = ["v1.2.0", "v1.10.0", "v2.0.0-rc.1", "main"];
  const seen = [];
  t.mock.method(globalThis, "fetch", async url => {
    seen.push(url);
    if (url.includes("/tags?")) return Response.json(versions.map(name => ({ name, commit: { sha } })));
    if (url.includes("/git/trees/" + sha)) return Response.json({ tree: [entry], truncated: false });
    assert.equal(url, "https://raw.githubusercontent.com/Auhyuan/DevHIM/" + sha + "/" + entry.path);
    return new Response(content);
  });
  const snapshot = await loadSnapshot("skill", false);
  assert.equal(snapshot.version, "1.10.0");
  assert.equal(snapshot.commit, sha);
  assert.deepEqual(snapshot.skills[0].files, [["SKILL.md", content]]);
  assert.equal(seen.length, 3);
});

test("missing stable tag fails explicitly and offline plugin needs no network", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json([]));
  await assert.rejects(loadSnapshot("skill", false), /稳定版本标签.*--offline/);
  const snapshot = await loadSnapshot("plugin", true);
  assert.equal(fetch.mock.callCount(), 1);
  assert.equal(snapshot.skills.length, 4);
});

test("update uses the installed baseline, preserves edits and removes only untouched obsolete files", async t => {
  const root = fileURLToPath(new URL("../../tmp/", import.meta.url));
  await mkdir(root, { recursive: true });
  const project = await mkdtemp(join(root, "devhim-update-test-"));
  t.after(() => rm(project, { recursive: true, force: true }));
  const selection = { scope: "project", mode: "skill", project, tools: ["codex"] };
  const snapshot = (version, files) => ({
    version, source: "GitHub v" + version, commit: sha,
    skills: [{ name: "p-sop", files: Object.entries(files).map(([p, s]) => [p, Buffer.from(s)]) }],
  });
  const v1 = snapshot("1.0.0", { "SKILL.md": "one", "old.md": "obsolete" });
  const v2 = snapshot("2.0.0", { "SKILL.md": "two", "new.md": "new" });
  const plan = async (snap, update) => (await createPlan(selection, snap, update))[0];
  assert.equal((await plan(v2, true)).blocked, true);
  const init = await plan(v1, false);
  await applyPlan(init);
  const dir = init.target.bundle;
  const skill = join(dir, "SKILL.md");
  const old = join(dir, "old.md");
  await writeFile(join(dir, "mine.md"), "user");
  await writeFile(old, "edited");
  assert.equal((await plan(v2, true)).blocked, true);
  assert.equal(await readFile(skill, "utf8"), "one");
  await writeFile(old, "obsolete");
  const preview = await plan(v2, true);
  assert.equal(preview.blocked, false);
  assert.match(preview.previous, /1.0.0/);
  await writeFile(skill, "edited after preview");
  await assert.rejects(applyPlan(preview), /预览后/);
  await unlink(skill);
  assert.equal((await plan(v2, true)).blocked, true);
  await writeFile(skill, "one");
  await applyPlan(await plan(v2, true));
  assert.equal(await readFile(skill, "utf8"), "two");
  assert.equal(await readFile(join(dir, "mine.md"), "utf8"), "user");
  await assert.rejects(readFile(old), { code: "ENOENT" });
  assert.ok((await plan(v2, true)).files.every(f => f.action === "same"));
});
