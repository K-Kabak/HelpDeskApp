#!/usr/bin/env node

/**
 * Ensures .env.example lists required variables without real secrets.
 */

import fs from "node:fs";
import path from "node:path";

const requiredKeys = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
const examplePath = path.join(process.cwd(), ".env.example");

if (!fs.existsSync(examplePath)) {
  console.error("Missing .env.example. Please add it with required keys.");
  process.exit(1);
}

const content = fs.readFileSync(examplePath, "utf8");
const keysInFile = new Set(
  content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=")[0])
);

const missing = requiredKeys.filter((key) => !keysInFile.has(key));

if (missing.length) {
  console.error(".env.example is missing required keys:");
  missing.forEach((key) => console.error(`- ${key}`));
  process.exit(1);
}

console.log(".env.example contains required keys:", requiredKeys.join(", "));
