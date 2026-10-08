#!/usr/bin/env python3
"""Package self-contained P-SOP skills and a plugin from one dashboard source."""

import argparse
import json
import re
import tempfile
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


SOP_ROOT = Path(__file__).resolve().parents[1]
BOARD_ROOT = SOP_ROOT.parent / "p-sop-build-pp"
PROJECT_ROOT = SOP_ROOT.parents[2]
MANIFEST = {
    "name": "p-sop",
    "version": "0.2.3",
    "description": "项目开发 SOP 与可独立使用的项目进度看板。",
    "author": {"name": "Auhyuan"},
    "skills": "./skills/",
    "interface": {
        "displayName": "P-SOP",
        "shortDescription": "规范项目开发，并按需独立构建项目进度看板。",
        "longDescription": "包含 p-sop 项目开发流程与 build-pp 项目进度看板两项 Skill；复用现有资料，保持状态、证据与文件入口易读。",
        "developerName": "Auhyuan",
        "category": "Productivity",
        "capabilities": [],
        "defaultPrompt": [
            "使用 P-SOP 接续当前项目的开发流程。",
            "仅使用 build-pp，根据现有资料更新项目进度看板。",
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


def sync_dashboard_resources(check=False):
    # P-SOP owns the source; the standalone shortcut carries generated copies.
    resources = ("references/dashboard-generation.md", "references/time-and-gap.md", "assets/dashboard-template.html")
    copies = [(BOARD_ROOT / relative, (SOP_ROOT / relative).read_bytes()) for relative in resources]
    stale = [(path, data) for path, data in copies if not path.is_file() or path.read_bytes() != data]
    if check and stale:
        raise ValueError("standalone dashboard resources are stale; run this script with --sync-only")
    for path, data in stale:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)


def plugin_entries(sop, board):
    entries = {}
    for files, name in ((sop, "p-sop"), (board, "build-pp")):
        for relative, data in files.items():
            if name == "build-pp" and relative == "SKILL.md":
                text, count = re.subn(r"(?m)^name: p-sop-build-pp$", "name: build-pp", data.decode("utf-8"), count=1)
                if count != 1:
                    raise ValueError("dashboard skill name changed; check plugin packaging before release")
                data = text.encode("utf-8")
            elif name == "build-pp" and relative == "agents/openai.yaml":
                data = data.decode("utf-8").replace("$p-sop-build-pp", "$build-pp").encode("utf-8")
            entries[f"p-sop/skills/{name}/{relative}"] = data

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
    parser.add_argument("--format", choices=("all", "skills", "plugin"), default="all", help="default: both standalone skill archives and the plugin")
    parser.add_argument("--output", help="plugin ZIP path inside the repository's tmp/; standalone ZIPs use the same directory")
    sync = parser.add_mutually_exclusive_group()
    sync.add_argument("--sync-only", action="store_true", help="sync standalone dashboard resources from P-SOP without creating archives")
    sync.add_argument("--check-sync", action="store_true", help="check resource copies without changing any files")
    args = parser.parse_args()
    if args.sync_only or args.check_sync:
        if args.output:
            parser.error("--output cannot be combined with a sync-only operation")
        try:
            sync_dashboard_resources(check=args.check_sync)
        except (ValueError, OSError) as error:
            parser.error(str(error))
        print("Dashboard resources are synchronized.")
        return
    if args.format == "skills" and args.output:
        parser.error("--output is for the plugin archive; omit it with --format skills")
    output = (PROJECT_ROOT / (args.output or "tmp/p-sop.zip")).resolve()
    if not output.is_relative_to((PROJECT_ROOT / "tmp").resolve()) or output.suffix != ".zip":
        parser.error("output must be a .zip file inside the repository's tmp/ directory")

    try:
        sync_dashboard_resources()
        sop = read_skill(SOP_ROOT)
        board = read_skill(BOARD_ROOT)
        archives = []
        if args.format in ("all", "skills"):
            for name, files in (("p-sop", sop), ("p-sop-build-pp", board)):
                archives.append((output.parent / f"{name}-skill.zip", {f"{name}/{path}": data for path, data in files.items()}))
        if args.format in ("all", "plugin"):
            archives.append((output, plugin_entries(sop, board)))
        if len({path for path, _ in archives}) != len(archives):
            parser.error("plugin output must not overwrite a standalone skill archive")
    except (ValueError, KeyError, OSError) as error:
        parser.error(str(error))
    for path, entries in archives:
        write_archive(path, entries)


if __name__ == "__main__":
    main()
