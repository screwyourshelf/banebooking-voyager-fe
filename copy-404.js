import fs from "fs";
import path from "path";

const distDir = path.resolve("dist");
const indexFile = path.join(distDir, "index.html");
const errorFile = path.join(distDir, "404.html");

fs.copyFileSync(indexFile, errorFile);
console.log("Copied index.html to 404.html");
