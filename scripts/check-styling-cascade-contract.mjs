import { fileURLToPath } from "node:url";
import { checkStylingCascadeContract } from "./styling-guards/cascade-contract.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const result = await checkStylingCascadeContract(projectRoot);
const layerSummary = Object.entries(result.layerRuleCounts)
  .map(([layer, count]) => `${layer} ${count}`)
  .join(", ");

console.log(
  `Styling cascade-kontrakten er intakt: ${result.stylesheetCount} filer, ${result.cssRuleCount} regler (${layerSummary}).`
);
