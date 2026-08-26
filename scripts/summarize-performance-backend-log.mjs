import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [inputArgument, outputArgument = "test-results/performance-backend-summary.json"] =
  process.argv.slice(2);

if (!inputArgument) {
  console.error(
    "Bruk: node scripts/summarize-performance-backend-log.mjs <backend.log> [output.json]"
  );
  process.exitCode = 1;
} else {
  const inputPath = path.resolve(inputArgument);
  const outputPath = path.resolve(outputArgument);
  const log = await readFile(inputPath, "utf8");
  const summary = summarize(log);
  await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Skrev ${summary.flows.length} flyter til ${outputPath}`);
}

export function summarize(log) {
  const entries = log
    .split(/(?=^(?:trace|debug|info|warn|fail|critical): )/gm)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const requests = new Map();
  const order = [];

  for (const entry of entries) {
    const requestId = entry.match(/RequestId:([^\s=>]+)/)?.[1];
    if (!requestId) continue;
    let request = requests.get(requestId);
    if (!request) {
      request = {
        dbQueries: 0,
        dbTimeMs: 0,
        durationMs: null,
        method: null,
        path: entry.match(/RequestPath:([^\s]+)/)?.[1] ?? null,
        requestId,
        status: null,
        url: null,
      };
      requests.set(requestId, request);
      order.push(request);
    }

    const started = entry.match(/Request starting \S+ (\S+) (\S+)/);
    if (started) {
      request.method = started[1];
      request.url = started[2];
    }
    const finished = entry.match(/Request finished \S+ (\S+) (\S+) - (\d{3}) .*? ([\d.]+)ms/);
    if (finished) {
      request.method = finished[1];
      request.url = finished[2];
      request.status = Number(finished[3]);
      request.durationMs = Number(finished[4]);
    }
    const dbCommand = entry.match(/Executed DbCommand \((\d+)ms\)/);
    if (dbCommand) {
      request.dbQueries += 1;
      request.dbTimeMs += Number(dbCommand[1]);
    }
  }

  const flows = [];
  let active = null;
  for (const request of order) {
    const marker = parseMarker(request.url);
    if (marker?.boundary === "start") {
      active = { label: marker.label, requests: [] };
      continue;
    }
    if (marker?.boundary === "end") {
      if (!active || active.label !== marker.label) {
        throw new Error(`Ubalansert målemarkør for ${marker.label}.`);
      }
      flows.push(summarizeFlow(active));
      active = null;
      continue;
    }
    if (active) active.requests.push(request);
  }

  if (active) throw new Error(`Mangler sluttmarkør for ${active.label}.`);

  return {
    flows,
    generatedAt: new Date().toISOString(),
    note: "DB-tid er summen av EF Core DbCommand-varigheter i den lokale requestscopen.",
  };
}

function parseMarker(url) {
  if (!url) return null;
  const parsed = new URL(url);
  const label = parsed.searchParams.get("performanceFlow");
  const boundary = parsed.searchParams.get("boundary");
  return label && (boundary === "start" || boundary === "end") ? { boundary, label } : null;
}

function summarizeFlow(flow) {
  const requests = flow.requests.filter((request) => request.path?.startsWith("/api/"));
  return {
    dbQueries: requests.reduce((sum, request) => sum + request.dbQueries, 0),
    dbTimeMs: requests.reduce((sum, request) => sum + request.dbTimeMs, 0),
    label: flow.label,
    requests,
  };
}
