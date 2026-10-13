#!/usr/bin/env python3
"""Package the self-contained P-SOP skill and its single-skill plugin."""

import argparse
import json
import tempfile
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


SOP_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = SOP_ROOT.parents[2]
MANIFEST = {
    "name": "p-sop",
    "version": "0.3.0",
    "description": "项目开发 SOP，内置按需生成项目进度看板的能力。",
    "author": {"name": "Auhyuan"},
    "skills": "./skills/",
    "interface": {
        "displayName": "P-SOP",
        "shortDescription": "规范项目开发，并按需构建项目进度看板。",
        "longDescription": "通过 p-sop 管理项目开发流程，并按需生成项目进度看板；复用现有资料，保持状态、证据与文件入口易读。",
        "developerName": "Auhyuan",
        "category": "Productivity",
        "capabilities": [],
        "defaultPrompt": [
            "使用 P-SOP 接续当前项目的开发流程。",
            "使用 P-SOP，根据现有资料仅更新项目进度看板。",
        ],
    },
}


def skill_files(root):
    yield root / "SKILL.md"
    for folder in ("agents", "references", "assets"):
        for path in sorted((root / folder).rglob("*")):
            if path.is_file() and not any(part.startswith(".") for part in path.relative_to(root).parts):
                yield path


def read_skill(root):
    if not (root / "SKILL.md").is_file():
        raise ValueError(f"missing skill entry: {root / 'SKILL.md'}")
    return {source.relative_to(root).as_posix(): source.read_bytes() for source in skill_files(root)}


def plugin_entries(sop):
    entries = {f"p-sop/skills/p-sop/{relative}": data for relative, data in sop.items()}

    entries["p-sop/.codex-plugin/plugin.json"] = (json.dumps(MANIFEST, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    return entries


def write_archive(output, entries):
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=output.parent, suffix=".zip.tmp", delete=False) as file:
        temporary = Path(file.name)
    try:
        with ZipFile(temporary, "w", compression=ZIP_DEFLATED) as archive:
            for path, data in sorted(entries.items()):
                archive.writestr(path, data)
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)
    print(f"Archive: {output}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--format", choices=("all", "skills", "plugin"), default="all", help="default: the standalone P-SOP skill archive and the plugin")
    parser.add_argument("--output", help="plugin ZIP path inside the repository's tmp/; the skill ZIP uses the same directory")
    args = parser.parse_args()
    if args.format == "skills" and args.output:
        parser.error("--output is for the plugin archive; omit it with --format skills")
    output = (PROJECT_ROOT / (args.output or "tmp/p-sop.zip")).resolve()
    if not output.is_relative_to((PROJECT_ROOT / "tmp").resolve()) or output.suffix != ".zip":
        parser.error("output must be a .zip file inside the repository's tmp/ directory")

    try:
        sop = read_skill(SOP_ROOT)
        archives = []
        if args.format in ("all", "skills"):
            archives.append((output.parent / "p-sop-skill.zip", {f"p-sop/{path}": data for path, data in sop.items()}))
        if args.format in ("all", "plugin"):
            archives.append((output, plugin_entries(sop)))
        if len({path for path, _ in archives}) != len(archives):
            parser.error("plugin output must not overwrite a standalone skill archive")
    except (ValueError, KeyError, OSError) as error:
        parser.error(str(error))
    for path, entries in archives:
        write_archive(path, entries)


if __name__ == "__main__":
    main()
