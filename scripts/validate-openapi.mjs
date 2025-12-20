import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const openapiPath = path.join(process.cwd(), "docs", "openapi.yaml");

try {
  const content = fs.readFileSync(openapiPath, "utf8");
  parse(content);
  console.log(`OpenAPI validated: ${openapiPath}`);
} catch (error) {
  console.error("OpenAPI lint failed:", error.message || error);
  process.exitCode = 1;
}
