import crypto, { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const API_HOST = "https://api.switch-bot.com";
/** civ-os solidSwitchBotEphemeral.ts と同型 — 温湿度系のみ自動ポーリング */
const METERISH = /meter|hub mini|hub 2|hub2|outdoor|woiosensor|climate|co2|温湿度/i;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const initialEnvKeys = new Set(Object.keys(process.env));

function parseEnvValue(raw) {
  let value = raw.trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
}

function loadLayeredEnv() {
  const sources = [
    path.join(repoRoot, ".env.platform"),
    path.join(repoRoot, ".env.local"),
    path.join(repoRoot, ".env"),
    path.join(__dirname, ".env"),
  ];
  for (const file of sources) {
    if (!existsSync(file)) continue;
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      const key = t.slice(0, i).trim();
      if (initialEnvKeys.has(key)) continue;
      process.env[key] = parseEnvValue(t.slice(i + 1));
    }
  }
}

loadLayeredEnv();

function env(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

function signSwitchBotHeaders() {
  const token = env("SWITCHBOT_TOKEN");
  const secret = env("SWITCHBOT_SECRET");
  const t = Date.now().toString();
  const nonce = randomUUID();
  const sign = crypto.createHmac("sha256", secret).update(token + t + nonce).digest("base64");
  return { Authorization: token, sign, nonce, t };
}

function parseAccountDevices(data) {
  const devices = [];
  if (!data || typeof data !== "object") return devices;
  const body = data.body;
  if (!body || typeof body !== "object" || !Array.isArray(body.deviceList)) return devices;
  for (const item of body.deviceList) {
    if (!item || typeof item !== "object") continue;
    const deviceId = typeof item.deviceId === "string" ? item.deviceId : "";
    if (!deviceId) continue;
    const deviceType = typeof item.deviceType === "string" ? item.deviceType : "Unknown";
    devices.push({ deviceId, deviceType });
  }
  return devices;
}

async function listSwitchBotDevices() {
  const res = await fetch(`${API_HOST}/v1.1/devices`, { headers: signSwitchBotHeaders() });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`SWITCHBOT_LIST_HTTP_${res.status}`);
  return parseAccountDevices(data);
}

async function resolveDeviceIds() {
  const configured = env("SWITCHBOT_DEVICE_IDS").split(",").map((x) => x.trim()).filter(Boolean);
  if (configured.length > 0) return configured;
  const devices = await listSwitchBotDevices();
  const meterIds = devices.filter((d) => METERISH.test(d.deviceType)).map((d) => d.deviceId);
  if (meterIds.length === 0) {
    throw new Error(
      "SWITCHBOT_DEVICE_IDS is empty and no meter-like devices found via GET /v1.1/devices — set SWITCHBOT_DEVICE_IDS or add a Meter to your SwitchBot account",
    );
  }
  console.log(JSON.stringify({ type: "collector_device_discover", count: meterIds.length, source: "auto_meter_filter" }));
  return meterIds;
}

async function fetchDeviceStatus(deviceId) {
  const res = await fetch(`${API_HOST}/v1.1/devices/${encodeURIComponent(deviceId)}/status`, {
    headers: signSwitchBotHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`SWITCHBOT_HTTP_${res.status}`);
  return data;
}

function numberField(body, keys) {
  for (const key of keys) {
    const value = body[key];
    const n = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function sanitizeStatus(raw) {
  const body = raw && typeof raw === "object" && raw.body && typeof raw.body === "object" ? raw.body : raw ?? {};
  const measurements = {};
  const temperatureC = numberField(body, ["temperature", "temperatureC"]);
  const humidityPct = numberField(body, ["humidity", "humidityPct"]);
  const co2Ppm = numberField(body, ["CO2", "co2", "co2Ppm"]);
  const lightLevel = numberField(body, ["lightLevel", "illuminance", "lux"]);
  const batteryPct = numberField(body, ["battery", "batteryPct"]);
  if (temperatureC !== undefined) measurements.temperatureC = temperatureC;
  if (humidityPct !== undefined) measurements.humidityPct = humidityPct;
  if (co2Ppm !== undefined) measurements.co2Ppm = co2Ppm;
  if (lightLevel !== undefined) measurements.lightLevel = lightLevel;
  if (batteryPct !== undefined) measurements.batteryPct = batteryPct;
  return measurements;
}

function privateKey() {
  const b64 = env("ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64");
  if (!b64) throw new Error("ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64 is required");
  return crypto.createPrivateKey(Buffer.from(b64, "base64").toString("utf8"));
}

function signIngestBody(body) {
  const ts = Date.now().toString();
  const signature = crypto.sign(null, Buffer.from(`${ts}.${canonicalJson(body)}`, "utf8"), privateKey()).toString("base64");
  return { ts, signature };
}

async function appendQueue(body) {
  const file = env("COLLECTOR_QUEUE_FILE", "/data/queue.jsonl");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, `${JSON.stringify(body)}\n`, "utf8");
}

async function readQueue() {
  const file = env("COLLECTOR_QUEUE_FILE", "/data/queue.jsonl");
  const text = await fs.readFile(file, "utf8").catch(() => "");
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

async function writeQueue(items) {
  const file = env("COLLECTOR_QUEUE_FILE", "/data/queue.jsonl");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, items.map((item) => JSON.stringify(item)).join("\n") + (items.length ? "\n" : ""), "utf8");
}

async function collectOnce() {
  if (!env("SWITCHBOT_TOKEN") || !env("SWITCHBOT_SECRET")) throw new Error("SWITCHBOT_TOKEN and SWITCHBOT_SECRET are required");
  const ids = await resolveDeviceIds();
  const readings = [];
  for (const deviceId of ids) {
    try {
      const raw = await fetchDeviceStatus(deviceId);
      readings.push({ deviceId, measurements: sanitizeStatus(raw) });
    } catch (e) {
      console.error(JSON.stringify({ type: "collector_device_failed", deviceId, error: e.message }));
    }
  }
  if (readings.length === 0) return null;
  const body = {
    schema: "env_collector_ingest_v1",
    userId: env("CIV_USER_ID"),
    capturedAt: new Date().toISOString(),
    ...(env("ENV_PLACEMENT_ID") ? { placementId: env("ENV_PLACEMENT_ID") } : {}),
    ...(env("ENV_ANNOTATION_ID") ? { annotationId: env("ENV_ANNOTATION_ID") } : {}),
    readings,
  };
  await appendQueue(body);
  return body;
}

async function flushQueue() {
  const ingestUrl = env("CIV_INGEST_URL");
  if (!ingestUrl) throw new Error("CIV_INGEST_URL is required");
  const queue = await readQueue();
  const rest = [];
  for (const body of queue) {
    const { ts, signature } = signIngestBody(body);
    const res = await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-IHL-Collector-Id": env("CIV_COLLECTOR_ID", "local"),
        "X-IHL-Collector-Timestamp": ts,
        "X-IHL-Collector-Signature": signature,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      rest.push(body);
      console.error(JSON.stringify({ type: "collector_ingest_failed", status: res.status, body: await res.text().catch(() => "") }));
    }
  }
  await writeQueue(rest);
  return { sent: queue.length - rest.length, remaining: rest.length };
}

async function cycle() {
  const collected = await collectOnce();
  const flushed = await flushQueue();
  console.log(JSON.stringify({ type: "collector_cycle", collected: Boolean(collected), ...flushed }));
}

function startLocalServer() {
  const port = Number(env("COLLECTOR_LOCAL_PORT", "8787"));
  http.createServer(async (req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }
    if (req.url === "/sync") {
      try {
        const result = await flushQueue();
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ ok: true, ...result }));
      } catch (e) {
        res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
      return;
    }
    res.writeHead(404);
    res.end();
  }).listen(port, "0.0.0.0", () => console.log(JSON.stringify({ type: "collector_local_server", port })));
}

if (process.argv.includes("--once")) {
  await cycle();
} else {
  startLocalServer();
  await cycle().catch((e) => console.error(JSON.stringify({ type: "collector_cycle_error", error: e.message })));
  setInterval(() => {
    cycle().catch((e) => console.error(JSON.stringify({ type: "collector_cycle_error", error: e.message })));
  }, Math.max(30, Number(env("COLLECTOR_INTERVAL_SEC", "300"))) * 1000);
}
