import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const apiDirectory = path.join(workspaceRoot, "artifacts", "api-server");
const frontendDirectory = path.join(
  workspaceRoot,
  "artifacts",
  "all-about-iot",
);
const children = new Set();
let shuttingDown = false;

function runProcess(name, args, cwd) {
  const child = spawn(process.execPath, args, { cwd, stdio: "inherit" });

  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (signal) {
        reject(new Error(`${name} stopped by ${signal}`));
      } else {
        resolve(code ?? 1);
      }
    });
  });
}

function stop(exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = exitCode;

  for (const child of children) {
    child.kill();
  }
}

process.once("SIGINT", () => stop(0));
process.once("SIGTERM", () => stop(0));

try {
  console.log("Building API server...");
  const buildExitCode = await runProcess(
    "API build",
    ["build.mjs"],
    apiDirectory,
  );
  if (buildExitCode !== 0) {
    throw new Error(`API build exited with code ${buildExitCode}`);
  }

  if (shuttingDown) process.exit();

  const services = [
    {
      name: "API",
      args: [
        "--env-file-if-exists=../../.env",
        "--enable-source-maps",
        "./dist/index.mjs",
      ],
      cwd: apiDirectory,
      env: {
        ...process.env,
        PORT: process.env.API_PORT ?? "5000",
      },
    },
    {
      name: "Frontend",
      args: ["node_modules/vite/bin/vite.js", "--config", "vite.config.ts"],
      cwd: frontendDirectory,
    },
  ];

  for (const service of services) {
    const child = spawn(process.execPath, service.args, {
      cwd: service.cwd,
      stdio: "inherit",
      env: service.env ?? process.env,
    });
    children.add(child);

    child.once("error", (error) => {
      console.error(`${service.name} failed to start:`, error);
      stop(1);
    });
    child.once("close", (code, signal) => {
      children.delete(child);
      if (!shuttingDown) {
        console.error(
          `${service.name} exited unexpectedly${signal ? ` (${signal})` : ` (code ${code})`}`,
        );
        stop(code ?? 1);
      }
    });
  }
} catch (error) {
  console.error("Unable to start the application:", error);
  stop(1);
}
