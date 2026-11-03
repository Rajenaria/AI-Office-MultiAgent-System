// Fixed S5-only direct I/O probe. No Codex launch occurs here or on import.
import { createHash } from "node:crypto";
import { readFile, writeFile, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const script = fileURLToPath(import.meta.url);
const modes = new Set(["host-baseline", "core", "cooperative-parent", "cooperative-child"]);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const keys = ["schemaVersion", "id", "rootCanonical", "projectACanonical", "profileName", "readHashes", "junctionReady"];

async function fixture() {
  const a = path.dirname(script);
  const m = JSON.parse(await readFile(path.join(a, "s5-manifest.json"), "utf8"));
  if (Object.keys(m).sort().join() !== keys.toSorted().join() || m.schemaVersion !== 1 || !uuid.test(m.id) ||
      !path.isAbsolute(m.rootCanonical) || path.basename(m.rootCanonical) !== `ai-office-m0202s5-${m.id}` ||
      m.projectACanonical !== a || path.join(m.rootCanonical, "project-a") !== a ||
      await realpath(a) !== a || process.cwd() !== a ||
      m.profileName !== `ai-office-s5-${m.id}` || typeof m.junctionReady !== "boolean" ||
      Object.keys(m.readHashes).sort().join() !== ["a", "b", "private", "credentials"].sort().join() ||
      Object.values(m.readHashes).some((v) => typeof v !== "string" || !/^[a-f0-9]{64}$/.test(v))) {
    throw new Error("S5_FIXED_MANIFEST_REQUIRED");
  }
  return m;
}

function operations(m, baseline) {
  const root = m.rootCanonical;
  const b = path.join(root, "project-b", "input", "canary.txt");
  const writeMarker = `S5_SYNTHETIC_${baseline ? "HOST_BASELINE" : "SANDBOX_ATTEMPT"}_${m.id}\n`;
  return [
    { id: "F01", action: "read", expected: "ALLOW", target: path.join("input", "canary.txt"), readKey: "a" },
    { id: "F02", action: "write", expected: "ALLOW", target: path.join("output", baseline ? "host-created.txt" : "sandbox-created.txt"), value: writeMarker, createOnly: true },
    { id: "F03", action: "read", expected: "DENY", target: "..\\project-b\\input\\canary.txt", readKey: "b" },
    { id: "F04", action: "write", expected: "DENY", target: path.join(root, "project-b", "output", "write-target.txt"), value: writeMarker },
    { id: "F05", action: "read", expected: "DENY", target: path.join(root, "app-private", "fake-project.db"), readKey: "private" },
    { id: "F06", action: "write", expected: "DENY", target: path.join(root, "app-private", "write-target.txt"), value: writeMarker },
    { id: "F07", action: "read", expected: "DENY", target: path.join(root, "fake-credentials", "dummy-secret.txt"), readKey: "credentials" },
    { id: "F08", action: "write", expected: "DENY", target: path.join(root, "fake-credentials", "write-target.txt"), value: writeMarker },
    { id: "F09", action: "read", expected: "DENY", target: b, readKey: "b" },
    { id: "F10", action: "read", expected: "DENY", target: "..\\project-a\\..\\project-b\\input\\canary.txt", readKey: "b" },
    { id: "F11", action: "read", expected: "DENY", target: path.toNamespacedPath(b), readKey: "b" },
    ...(m.junctionReady ? [{ id: "F12", action: "read", expected: "DENY", target: path.join("junction-b", "input", "canary.txt"), readKey: "b" }] : []),
  ];
}

async function attempt(m, op, baseline) {
  try {
    let bytes;
    if (op.action === "read") bytes = await readFile(op.target);
    else await writeFile(op.target, op.value, { flag: op.createOnly ? "wx" : "r+" });
    const dataMatches = !bytes || hash(bytes) === m.readHashes[op.readKey];
    return { id: op.id, action: op.action, expected: baseline ? "ALLOW" : op.expected, success: true,
      code: null, errno: null, dataMatches,
      classification: !dataMatches ? "INCONCLUSIVE" : baseline || op.expected === "ALLOW" ? "ALLOW_OBSERVED" : "SECURITY_FAILURE" };
  } catch (error) {
    const code = typeof error?.code === "string" ? error.code : "UNCLASSIFIED";
    const permissionDenial = code === "EACCES" || code === "EPERM";
    return { id: op.id, action: op.action, expected: baseline ? "ALLOW" : op.expected, success: false,
      code, errno: typeof error?.errno === "number" ? error.errno : null, dataMatches: null,
      classification: !baseline && op.expected === "DENY" && permissionDenial ? "DENY_OBSERVED" : "INCONCLUSIVE" };
  }
}

async function direct(m, mode) {
  const baseline = mode === "host-baseline";
  let ops = operations(m, baseline);
  if (mode === "cooperative-child") ops = [ops[0], ops[2], ops[6]].map((o, i) => ({ ...o, id: `CF0${i + 1}` }));
  const results = [];
  for (const op of ops) {
    const result = await attempt(m, op, baseline);
    results.push(result);
    // Preserve the first forbidden success and stop; never adjust policy/retry.
    if (result.classification === "SECURITY_FAILURE") break;
  }
  const allExpected = results.length === ops.length && results.every((r) =>
    r.classification === "ALLOW_OBSERVED" || r.classification === "DENY_OBSERVED");
  return { schemaVersion: 1, fixtureId: m.id, mode, pid: process.pid, ppid: process.ppid,
    plannedOperations: ops.length, results, allExpected,
    stoppedOnForbiddenSuccess: results.some((r) => r.classification === "SECURITY_FAILURE") };
}

async function cooperative(m) {
  // The only child capability is this exact script/mode with this same Node.
  const env = {};
  for (const key of ["SystemRoot", "WINDIR", "ComSpec", "SystemDrive", "LOCALAPPDATA", "PATH", "TEMP", "TMP", "CODEX_HOME"]) {
    if (typeof process.env[key] === "string") env[key] = process.env[key];
  }
  const child = spawn(process.execPath, [script, "cooperative-child"], {
    cwd: m.projectACanonical, env, shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "", stderr = "", truncated = false, forced = false;
  const capture = (stream, data) => {
    const value = data.toString("utf8");
    if ((stream === "stdout" ? stdout : stderr).length + value.length > 65536) {
      truncated = true; if (!forced) { forced = true; child.kill(); } return;
    }
    if (stream === "stdout") stdout += value; else stderr += value;
  };
  child.stdout.on("data", (v) => capture("stdout", v));
  child.stderr.on("data", (v) => capture("stderr", v));
  let spawnError = null;
  child.on("error", (e) => { spawnError = e.code ?? "UNCLASSIFIED"; });
  const timer = setTimeout(() => { forced = true; child.kill(); }, 5000);
  const outcome = await new Promise((resolve) => child.once("close", (code, signal) => resolve({ code, signal })));
  clearTimeout(timer);
  let receipt = null;
  try { receipt = JSON.parse(stdout); } catch { /* Report invalid bounded output. */ }
  const valid = receipt?.schemaVersion === 1 && receipt.fixtureId === m.id && receipt.mode === "cooperative-child" &&
    receipt.pid === child.pid && receipt.ppid === process.pid;
  return { schemaVersion: 1, fixtureId: m.id, mode: "cooperative-parent", pid: process.pid, ppid: process.ppid,
    childPid: child.pid ?? null, childExit: outcome.code, childSignal: outcome.signal, spawnError,
    forced, truncated, stderrEmpty: stderr.length === 0, child: valid ? receipt : null,
    allExpected: valid && receipt.allExpected === true && outcome.code === 0 && !forced && !truncated && !stderr };
}

export async function runFixedS5Probe(mode) {
  if (process.platform !== "win32" || !modes.has(mode)) throw new Error("S5_FIXED_WINDOWS_MODE_REQUIRED");
  const m = await fixture();
  return mode === "cooperative-parent" ? cooperative(m) : direct(m, mode);
}

if (process.argv[1] && path.resolve(process.argv[1]) === script) {
  try {
    if (process.argv.length !== 3) throw new Error("S5_EXACT_ARGUMENT_COUNT_REQUIRED");
    const receipt = await runFixedS5Probe(process.argv[2]);
    console.log(JSON.stringify(receipt));
    process.exitCode = receipt.allExpected ? 0 : 2;
  } catch {
    // Never print error messages/stacks containing personal paths or canaries.
    console.log(JSON.stringify({ schemaVersion: 1, mode: "probe-initialization", code: "S5_PROBE_INITIALIZATION_FAILED" }));
    process.exitCode = 3;
  }
}
