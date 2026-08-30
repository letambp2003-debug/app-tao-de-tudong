import fs from "fs";
import path from "path";

// 1. Remove BOM from all files in the project
function stripBom(filePath) {
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
      fs.writeFileSync(filePath, buffer.slice(3));
      console.log("[STRIPPED BOM]", filePath);
    }
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === "node_modules" || f === ".git" || f === "dist" || f === "dist-server") continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkDir(full);
    } else if (f.endsWith(".json") || f.endsWith(".js") || f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".css") || f.endsWith(".html")) {
      stripBom(full);
    }
  }
}

walkDir(".");

console.log("BOM cleanup complete.");
