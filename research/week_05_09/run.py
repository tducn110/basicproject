#!/usr/bin/env python3
"""Run the actual native reference experiment, retain logs and source provenance."""
import csv
import hashlib
import json
import os
from pathlib import Path
import platform
import statistics
import subprocess
import sys
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
RESULTS = HERE / "results"
CARGO = os.environ.get("CARO_CARGO", "/home/pro/.cargo/bin/cargo")
RUSTC = str(Path(CARGO).with_name("rustc"))


def command(args, log):
    result = subprocess.run(args, cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (RESULTS / log).write_text(result.stdout)
    print(result.stdout, end="")
    if result.returncode:
        raise SystemExit(result.returncode)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    RESULTS.mkdir(exist_ok=True)
    started = datetime.now(timezone.utc).isoformat()
    sources = sorted((ROOT / "caro-core-reference" / "src").rglob("*.rs"))
    sources += sorted((ROOT / "caro-core-reference" / "tests").rglob("*.rs"))
    sources += [ROOT / "caro-core-reference" / "Cargo.toml", ROOT / "caro-core-reference" / "Cargo.lock", HERE / "src" / "main.rs", HERE / "Cargo.toml", HERE / "run.py"]
    hashes = {str(p.relative_to(ROOT)): sha(p) for p in sources}
    composite = hashlib.sha256("\n".join(f"{k} {v}" for k, v in sorted(hashes.items())).encode()).hexdigest()
    command([CARGO,"test","--manifest-path",str(ROOT / "caro-core-reference" / "Cargo.toml"),"--locked"], "reference_tests.log")
    command([CARGO,"run","--release","--locked","--manifest-path",str(HERE / "Cargo.toml"),"--",str(RESULTS)], "experiment.log")
    raw = list(csv.DictReader((RESULTS / "search_runs.csv").open()))
    groups = {}
    keys = ["fixture","algorithm","move_mode","radius","cap","ordering","depth"]
    for row in raw:
        groups.setdefault(tuple(row[k] for k in keys), []).append(row)
    summaries = []
    for key, rows in groups.items():
        fixed = {k: v for k, v in rows[0].items() if k not in ["repeat","elapsed_us"]}
        for row in rows[1:]:
            assert fixed == {k: v for k, v in row.items() if k not in ["repeat","elapsed_us"]}, "Nondeterministic counter or result"
        median = statistics.median(int(row["elapsed_us"]) for row in rows)
        summaries.append({**fixed,"repeats": len(rows),"elapsed_us_median": median,"elapsed_us_min":min(int(r["elapsed_us"]) for r in rows),"elapsed_us_max":max(int(r["elapsed_us"]) for r in rows)})
    with (RESULTS / "search_summary.csv").open("w") as f:
        writer=csv.DictWriter(f,fieldnames=list(summaries[0]));writer.writeheader();writer.writerows(summaries)
    cpu="unavailable"
    if Path("/proc/cpuinfo").exists():
        for line in Path("/proc/cpuinfo").read_text().splitlines():
            if line.startswith("model name"):
                cpu=line.split(":",1)[1].strip();break
    metadata={
        "started_utc":started,"finished_utc":datetime.now(timezone.utc).isoformat(),
        "platform":platform.platform(),"machine":platform.machine(),"cpu_model":cpu,
        "logical_cpu_count":os.cpu_count(),"python_version":platform.python_version(),
        "rustc":subprocess.check_output([RUSTC,"--version"],text=True).strip(),
        "cargo":subprocess.check_output([CARGO,"--version"],text=True).strip(),
        "profile":"release","measured_clock":"std::time::Instant wall time in microseconds",
        "timing_scope":"search call only; state clone and TT/Zobrist initialization excluded",
        "execution":"sequential native calls; 3 repeats for four controlled fixtures; 1 for seeded positions",
        "controls":"same source, weights, rule, depth and move configuration per paired comparison; cold TT per optimized call",
        "not_claimed":["browser timing","Wasm timing","device behavior","strength or win rate","universal speedup","fixed memory TT"],
        "source_tree_sha256":composite,"source_files_sha256":hashes,
        "raw_search_rows":len(raw),"summary_rows":len(summaries),
        "commands":[f"{CARGO} test --manifest-path caro-core-reference/Cargo.toml --locked",f"{CARGO} run --release --locked --manifest-path research/week_05_09/Cargo.toml -- research/week_05_09/results"],
    }
    (RESULTS / "provenance.json").write_text(json.dumps(metadata,indent=2)+"\n")
    print(f"Retained {len(raw)} raw rows and {len(summaries)} deterministic summaries; source SHA256 {composite}")


if __name__=="__main__":
    main()
