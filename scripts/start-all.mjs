import { spawn } from "node:child_process";
import path from "node:path";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];
const rootDir = process.cwd();

function run(name, cwd, args) {
  const child = spawn(npmCommand, args, {
    cwd: path.resolve(rootDir, cwd),
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[${name}] finished with ${reason}`);

    if (signal || code !== 0) {
      shutdown(code ?? 1);
    }
  });

  child.on("error", (error) => {
    console.error(`[${name}] failed to start:`, error.message);
    shutdown(1);
  });

  children.push(child);
}

function shutdown(exitCode = 0) {
  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

run("backend", "BACKEND", ["start"]);
run("frontend", "FRONTEND", ["start"]);
