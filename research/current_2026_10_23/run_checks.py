#!/usr/bin/env python3
"""Reproduce current-engine checks; keep frozen week_05_09 evidence separate."""
from __future__ import annotations
import argparse
import csv
import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import statistics
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
ENGINE = ROOT / "gomoku-main" / "engine"
APP = ROOT / "10_caro"
CARGO_BIN = Path("/home/pro/.cargo/bin")
ENV = dict(os.environ, PATH=str(CARGO_BIN) + os.pathsep + os.environ["PATH"])


def run(name: str, command: list[str], cwd: Path, env: dict | None = None) -> None:
    result = subprocess.run(command, cwd=cwd, env=env or ENV, capture_output=True, text=True)
    (HERE / (name + ".log")).write_text(
        "$ " + " ".join(command) + "\n" + result.stdout + result.stderr
        + "\nexit_code=" + str(result.returncode) + "\n"
    )
    print(name + ": " + str(result.returncode), flush=True)
    if result.returncode:
        raise SystemExit(result.returncode)


def source_manifest() -> None:
    paths = sorted(set(
        list((ENGINE / "src").glob("*.rs"))
        + list((ENGINE / "tests").glob("*.rs"))
        + list((ENGINE / "examples").glob("*.rs"))
        + [ENGINE / "Cargo.toml", ENGINE / "Cargo.lock", APP / "package.json", APP / "package-lock.json"]
        + list((APP / "src").rglob("*.ts"))
        + list((APP / "src").rglob("*.tsx"))
        + list((APP / "tests").rglob("*.ts"))
        + list((APP / "tests").rglob("*.tsx"))
        + list((APP / "src/game/wasm/engine").glob("*.wasm"))
    ))
    rows = [{"path": str(p.relative_to(ROOT)), "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
            for p in paths if p.is_file()]
    versions = {}
    for label, cmd in [("rustc", ["rustc", "--version"]), ("cargo", ["cargo", "--version"]),
                       ("wasm_pack", ["wasm-pack", "--version"]), ("node", ["node", "--version"])]:
        versions[label] = subprocess.run(cmd, env=ENV, capture_output=True, text=True).stdout.strip()
    git = {}
    for label, args in [("head", ["rev-parse", "HEAD"]), ("branch", ["branch", "--show-current"]),
                        ("status", ["status", "--short"])]:
        git[label] = subprocess.run(["git", *args], cwd=APP, capture_output=True, text=True).stdout.strip()
    payload = {"captured_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
               "scope": "local uncommitted implementation, not a new Git commit",
               "versions": versions, "app_git": git, "sources": rows}
    (HERE / "provenance.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def summarize_search() -> None:
    groups: dict[tuple[str, ...], list[dict[str, str]]] = {}
    keys = ["fixture", "algorithm", "ordered", "requested_depth", "radius", "soft_cap"]
    stable = ["score", "best_x", "best_y", "nodes", "leaves", "cutoffs",
              "rank_evaluations", "candidates_before_cap", "completed_depth"]
    with (HERE / "engine_search_runs.csv").open() as source:
        for row in csv.DictReader(source):
            groups.setdefault(tuple(row[key] for key in keys), []).append(row)
    fields = keys + ["repeats"] + stable + ["median_elapsed_ns", "min_elapsed_ns", "max_elapsed_ns"]
    with (HERE / "engine_search_summary.csv").open("w", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=fields)
        writer.writeheader()
        for key, rows in groups.items():
            for field in stable:
                if len({row[field] for row in rows}) != 1:
                    raise ValueError("Non-deterministic " + field + " in " + str(key))
            times = [int(row["elapsed_ns"]) for row in rows]
            writer.writerow(dict(zip(keys, key), repeats=len(rows),
                                 **{field: rows[0][field] for field in stable},
                                 median_elapsed_ns=int(statistics.median(times)),
                                 min_elapsed_ns=min(times), max_elapsed_ns=max(times)))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=["native", "experiments", "wasm", "frontend", "manifest", "all"])
    stage = parser.parse_args().stage
    if stage in ("native", "all"):
        run("G3_native_tests", ["cargo", "test", "--manifest-path", str(ENGINE / "Cargo.toml"),
                               "--locked", "--offline"], ROOT)
    if stage in ("experiments", "all"):
        run("G3_engine_experiments", ["cargo", "run", "--release", "--locked", "--offline",
                                     "--manifest-path", str(ENGINE / "Cargo.toml"),
                                     "--example", "current_evidence", "--", str(HERE)], ROOT)
        summarize_search()
    if stage in ("wasm", "all"):
        output = HERE / "wasm_web"
        run("G4_wasm_build", ["wasm-pack", "build", str(ENGINE), "--target", "web", "--release",
                              "--no-opt", "--out-dir", str(output), "--", "--locked", "--offline"], ROOT)
        target = APP / "src/game/wasm/engine"
        target.mkdir(parents=True, exist_ok=True)
        copied = []
        for pattern in ("*.js", "*.d.ts", "*.wasm", "package.json"):
            for src in output.glob(pattern):
                dest = target / src.name
                shutil.copy2(src, dest)
                copied.append({"source": str(src.relative_to(ROOT)), "target": str(dest.relative_to(ROOT)),
                               "sha256": hashlib.sha256(dest.read_bytes()).hexdigest()})
        (HERE / "wasm_package.json").write_text(json.dumps({
            "target": "web", "rust_release_profile": "opt-level=z,lto=true",
            "wasm_opt": "disabled explicitly with --no-opt; no wasm-opt speed claim",
            "files": copied}, indent=2) + "\n")
    if stage in ("frontend", "all"):
        run("G5_typecheck", ["npm", "run", "typecheck"], APP)
        run("G5_frontend_tests", ["npm", "test"], APP)
        run("G5_frontend_build", ["npm", "run", "build"], APP)
        run("G5_diff_check", ["git", "diff", "--check"], APP)
    source_manifest()


if __name__ == "__main__":
    main()
