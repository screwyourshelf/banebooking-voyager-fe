import { fileURLToPath } from "node:url";
import { checkStylingProductionTree } from "./styling-guards/production-tree-contract.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const result = await checkStylingProductionTree(projectRoot);

console.log(
  `Styling-produksjonstreet er uten avvik: ${result.sourceFileCount} filer, ${Object.keys(result.diagnosticCountsByRule).length} håndhevede regel-ID-er.`
);
