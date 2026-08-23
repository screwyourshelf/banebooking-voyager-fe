import { fileURLToPath } from "node:url";
import { checkStylingThemeContract } from "./styling-guards/theme-contract.mjs";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const result = await checkStylingThemeContract(projectRoot);

console.log(
  `Styling theme-kontrakten er intakt: ${result.themeRoleCount} roller, ${result.semanticUtilityCount} utilities og ${result.darkChangedRoleCount} theme-skift.`
);
