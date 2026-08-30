import fs from "fs";
import path from "path";

const dirs = [
  "shared/types",
  "shared/schemas",
  "shared/rules",
  "server/config",
  "server/middleware",
  "server/routes",
  "server/services/ai",
  "server/services/validation",
  "server/services/extractor",
  "server/services/export",
  "server/services/database",
  "server/prompts",
  "server/data",
  "client/public",
  "client/src/components/layout",
  "client/src/components/common",
  "client/src/components/matrix",
  "client/src/components/spec",
  "client/src/components/questions",
  "client/src/components/validation",
  "client/src/components/preview",
  "client/src/components/export",
  "client/src/pages",
  "client/src/contexts",
  "client/src/services",
  "client/src/styles",
  "tests",
  "docs"
];

for (const dir of dirs) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log("Scaffold directories created successfully.");
