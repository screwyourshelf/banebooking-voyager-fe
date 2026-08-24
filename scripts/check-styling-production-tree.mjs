import { fileURLToPath } from "node:url";
import { checkStylingProductionTree } from "./styling-guards/production-tree-contract.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const result = await checkStylingProductionTree(projectRoot);
const activeRuleCount = Object.values(result.diagnosticCountsByRule).filter(
  (count) => count > 0
).length;

console.log(
  `Styling-produksjonstreet matcher baselinen: ${result.sourceFileCount} filer, ${result.diagnosticCount} registrerte avvik over ${activeRuleCount} aktive regel-ID-er.`
);
