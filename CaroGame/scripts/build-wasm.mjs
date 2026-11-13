import { createHash } from "node:crypto"
import { readdir, readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises"
import { tmpdir, homedir } from "node:os"
import { delimiter, dirname, join, relative, resolve } from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const engine = join(app, "engine")
const destination = join(app, "src/game/wasm/engine")
const env = { ...process.env, PATH: `${join(homedir(), ".cargo/bin")}${delimiter}${process.env.PATH ?? ""}` }
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex")

function command(program, args, capture = false, cwd = app) {
  const result = spawnSync(program, args, { cwd, env, encoding: "utf8", stdio: capture ? "pipe" : "inherit" })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${program} failed (${result.status}): ${result.stderr ?? ""}`)
  return result.stdout?.trim()
}

async function sourceFiles(directory) {
  const paths = []
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === "target") continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) paths.push(...await sourceFiles(path))
    else if (entry.isFile() && (entry.name.endsWith(".rs") || ["Cargo.toml", "Cargo.lock", "rust-toolchain.toml"].includes(entry.name))) paths.push(path)
  }
  return paths
}

const temporary = await mkdtemp(join(tmpdir(), "caro-wasm-"))
try {
  const args = ["build", "engine", "--target", "web", "--release", "--no-opt", "--out-dir", temporary, "--", "--locked", "--offline"]
  command("wasm-pack", args)
  const names = ["gomoku_engine.js", "gomoku_engine.d.ts", "gomoku_engine_bg.wasm", "gomoku_engine_bg.wasm.d.ts", "package.json"]
  const outputs = []
  await mkdir(destination, { recursive: true })
  for (const name of names) {
    const bytes = await readFile(join(temporary, name))
    await writeFile(join(destination, name), bytes)
    outputs.push({ path: `src/game/wasm/engine/${name}`, bytes: bytes.length, sha256: hash(bytes) })
  }
  const sources = []
  for (const path of await sourceFiles(engine)) sources.push({ path: relative(app, path).replaceAll("\\", "/"), sha256: hash(await readFile(path)) })
  const provenance = {
    schemaVersion: 1,
    scope: "Generated from this checkout's engine source; hashes identify inputs and outputs, not playing-strength calibration.",
    command: "wasm-pack build engine --target web --release --no-opt --out-dir <temporary> -- --locked --offline",
    target: "web",
    releaseProfile: { optLevel: "z", lto: true, wasmOpt: false },
    toolchain: { rustc: command("rustc", ["--version"], true, engine), cargo: command("cargo", ["--version"], true, engine), wasmPack: command("wasm-pack", ["--version"], true) },
    sources,
    outputs,
  }
  await writeFile(join(destination, "provenance.json"), JSON.stringify(provenance, null, 2) + "\n")
  console.log(`WASM package generated from engine/; SHA-256 ${outputs.find((file) => file.path.endsWith(".wasm")).sha256}`)
} finally {
  await rm(temporary, { recursive: true, force: true })
}
