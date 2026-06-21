#!/usr/bin/env node
// Usage: ANTHROPIC_API_KEY=sk-ant-... node test_runs/run_batch.js
// Starts the server, runs F2→F3 for Maths/Chemistry/Physics, saves pretty JSON.

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const PORT = 18787;
const BASE = `http://localhost:${PORT}`;
const OUT_DIR = path.join(__dirname);

const BATCHES = [
  { subjectLabel: "Maths", topic: "Pressure", band: "P5", prefix: "f2_maths_new" },
  { subjectLabel: "Chemistry", topic: "Acids, Bases and Salts", band: "P5", prefix: "f2_chemistry_new" },
  { subjectLabel: "Physics", topic: "Pressure", band: "P5", prefix: "f2_physics_new" },
];

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      { hostname: "localhost", port: PORT, path, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(new Error(`JSON parse error: ${e.message}\n${raw.slice(0, 400)}`)); }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function waitReady(ms = 30000) {
  const deadline = Date.now() + ms;
  return new Promise((resolve, reject) => {
    function attempt() {
      http.get(`${BASE}/health`, (r) => {
        if (r.statusCode === 200) return resolve();
        if (Date.now() < deadline) return setTimeout(attempt, 500);
        reject(new Error("Server did not become ready in time"));
      }).on("error", () => {
        if (Date.now() < deadline) return setTimeout(attempt, 500);
        reject(new Error("Server did not become ready in time"));
      });
    }
    attempt();
  });
}

async function runBatch({ subjectLabel, topic, band, prefix }) {
  console.log(`\n=== ${subjectLabel} > ${topic} ===`);

  console.log("  F2 generate...");
  const f2 = await post("/api/v1/f2/generate", { subjectLabel, topic, band, count: 10 });
  fs.writeFileSync(path.join(OUT_DIR, `${prefix}.pretty.json`), JSON.stringify(f2, null, 2));
  console.log(`  F2 done: ${f2.items?.length ?? 0} items`);

  console.log("  F3 verify...");
  const f3 = await post("/api/v1/f3/verify", { subjectLabel, topic, band, items: f2.items });
  fs.writeFileSync(path.join(OUT_DIR, `${prefix.replace("f2_", "f3_")}.pretty.json`), JSON.stringify(f3, null, 2));

  const reviews = f3.review?.reviews ?? [];
  const rejected = reviews.filter((r) => r.status === "REJECTED").length;
  const verified = reviews.filter((r) => r.status === "VERIFIED").length;
  console.log(`  F3 done: verdict=${f3.review?.batch_verdict}, verified=${verified}, rejected=${rejected}/${reviews.length}`);
  return { subjectLabel, verdict: f3.review?.batch_verdict, verified, rejected, total: reviews.length };
}

async function main() {
  const serverEnv = { ...process.env, PORT: String(PORT) };
  const serverScript = path.join(__dirname, "..", "server", "index.js");

  console.log("Starting server on port", PORT);
  const server = spawn(process.execPath, [serverScript], { env: serverEnv, stdio: ["ignore", "pipe", "pipe"] });
  server.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
  server.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));

  try {
    await waitReady();
    console.log("Server ready.");

    const results = [];
    for (const batch of BATCHES) {
      results.push(await runBatch(batch));
    }

    console.log("\n=== SUMMARY ===");
    for (const r of results) {
      console.log(`${r.subjectLabel}: verdict=${r.verdict}, verified=${r.verified}, rejected=${r.rejected}/${r.total}`);
    }
  } finally {
    server.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
