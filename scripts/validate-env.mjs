#!/usr/bin/env node

/**
 * Environment validation helper for local development.
 * - Verifies Node.js 22+
 * - Ensures pnpm is available (preferred package manager for this repo)
 * - Confirms DATABASE_URL is provided via env or .env.local
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const errors = [];
const warnings = [];

const minNodeMajor = 22;
const nodeVersion = process.versions.node;
const [major] = nodeVersion.split(".").map(Number);
if (!major || major < minNodeMajor) {
  errors.push(`Node.js ${minNodeMajor}+ required; found ${nodeVersion}.`);
}

const pnpmCheck = spawnSync("pnpm", ["--version"], { stdio: "pipe" });
const npmCheck = spawnSync("npm", ["--version"], { stdio: "pipe" });
if (pnpmCheck.status !== 0) {
  if (npmCheck.status === 0) {
    warnings.push("pnpm not found. Repo prefers pnpm (pnpm-lock.yaml present); install pnpm for consistency.");
  } else {
    warnings.push("No package manager detected (pnpm/npm). Install pnpm and ensure it is on PATH; PowerShell execution policy may block npm.");
  }
}

const envPath = path.join(process.cwd(), ".env.local");
const hasEnvVar = Boolean(process.env.DATABASE_URL);
const hasEnvFile = fs.existsSync(envPath);
let envFileHasKey = false;
if (hasEnvFile) {
  const content = fs.readFileSync(envPath, "utf8");
  envFileHasKey = /^DATABASE_URL=/m.test(content);
}

if (!hasEnvVar && !(hasEnvFile && envFileHasKey)) {
  errors.push("DATABASE_URL is missing. Add it to .env.local or export it in your shell.");
}

if (hasEnvFile && !envFileHasKey) {
  warnings.push("DATABASE_URL not found in .env.local (file exists but missing key).");
}

if (errors.length) {
  console.error("Environment validation failed:");
  errors.forEach((msg) => console.error(`- ${msg}`));
  if (warnings.length) {
    console.error("Warnings:");
    warnings.forEach((msg) => console.error(`- ${msg}`));
  }
  process.exit(1);
}

console.log("Environment validation passed.");
if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach((msg) => console.log(`- ${msg}`));
}
