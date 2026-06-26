/**
 * Local smoke: SwitchBot list/status + Ed25519 sign/verify roundtrip.
 * Never prints secret values — only pass/fail and var names set (yes/no).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const layeredPaths = [
  path.join(repoRoot, ".env.platform"),
  path.join(repoRoot, ".env.local"),
  path.join(repoRoot, ".env"), // legacy fallback
  path.join(__dirname, ".env"), // legacy fallback
];
const initialEnvKeys = new Set(Object.keys(process.env));

function parseEnvValue(raw) {
  let v = raw.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
}

function collectorPrivateKeyConfigured() {
  const candidates = layeredPaths;
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 1) continue;
      if (t.slice(0, i).trim() === "ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64") {
        return t.slice(i + 1).trim().length > 0;
      }
    }
  }
  return false;
}

function loadEnv(p) {
  const names = [];
  if (!fs.existsSync(p)) return names;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    const v = parseEnvValue(t.slice(i + 1));
    if (initialEnvKeys.has(k)) {
      names.push(k);
      continue;
    }
    process.env[k] = v;
    names.push(k);
  }
  return names;
}

if (collectorPrivateKeyConfigured()) {
  try {
    execFileSync(process.execPath, [path.join(__dirname, "sync-public-key-from-collector.mjs")], {
      stdio: "inherit",
      cwd: repoRoot,
    });
  } catch {
    // sync script already logged SYNC_PUBLIC_KEY=*
  }
}

console.log("ENV_SOURCES:");
for (const p of layeredPaths) {
  const names = loadEnv(p);
  console.log(`  path=${p} exists=${fs.existsSync(p)} vars_loaded=${names.length}`);
}

const check = [
  "SWITCHBOT_TOKEN",
  "SWITCHBOT_SECRET",
  "SWITCHBOT_DEVICE_IDS",
  "ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64",
  "ENV_COLLECTOR_PUBLIC_KEY",
  "ENV_COLLECTOR_PUBLIC_KEYS_JSON",
  "CIV_INGEST_URL",
  "CIV_USER_ID",
];
console.log("VARS_SET:");
for (const k of check) console.log(`  ${k}=${process.env[k]?.trim() ? "yes" : "no"}`);

const METERISH = /meter|hub mini|hub 2|hub2|outdoor|woiosensor|climate|co2|温湿度/i;

function signHeaders() {
  const token = (process.env.SWITCHBOT_TOKEN || "").trim();
  const secret = (process.env.SWITCHBOT_SECRET || "").trim();
  const t = Date.now().toString();
  const nonce = crypto.randomUUID();
  const sign = crypto.createHmac("sha256", secret).update(token + t + nonce).digest("base64");
  return { Authorization: token, sign, nonce, t };
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}

(async () => {
  const token = (process.env.SWITCHBOT_TOKEN || "").trim();
  const secret = (process.env.SWITCHBOT_SECRET || "").trim();
  if (!token || !secret) {
    console.log("SWITCHBOT_SMOKE=SKIP reason=missing_token_or_secret");
  } else {
    const res = await fetch("https://api.switch-bot.com/v1.1/devices", { headers: signHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code = data && typeof data === "object" ? data.message : "n/a";
      console.log(`SWITCHBOT_LIST=FAIL http=${res.status} message_code=${code}`);
    } else {
      const devs = data?.body?.deviceList || [];
      console.log(`SWITCHBOT_LIST=PASS device_count=${devs.length}`);
      const meterDevs = devs.filter((d) => d?.deviceType && METERISH.test(String(d.deviceType)));
      console.log(`SWITCHBOT_METER_DISCOVER=PASS meter_count=${meterDevs.length} configured_ids=${process.env.SWITCHBOT_DEVICE_IDS?.trim() ? "yes" : "no"}`);
      let ids = (process.env.SWITCHBOT_DEVICE_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
      if (!ids.length && meterDevs[0]?.deviceId) ids = [String(meterDevs[0].deviceId)];
      else if (!ids.length && devs[0]?.deviceId) ids = [String(devs[0].deviceId)];
      if (!ids.length) {
        console.log("SWITCHBOT_STATUS=SKIP reason=no_device_ids");
      } else {
        const did = ids[0];
        const res2 = await fetch(
          `https://api.switch-bot.com/v1.1/devices/${encodeURIComponent(did)}/status`,
          { headers: signHeaders() },
        );
        const st = await res2.json().catch(() => ({}));
        if (!res2.ok) {
          console.log(`SWITCHBOT_STATUS=FAIL http=${res2.status} message_code=${st?.message || "n/a"}`);
        } else {
          const body = st?.body && typeof st.body === "object" ? st.body : st;
          const hasT = body && (body.temperature != null || body.temperatureC != null);
          const hasH = body && (body.humidity != null || body.humidityPct != null);
          console.log(
            `SWITCHBOT_STATUS=PASS device_id_used=${ids[0] === String(meterDevs[0]?.deviceId) && !process.env.SWITCHBOT_DEVICE_IDS?.trim() ? "first_meter_auto" : "first_configured_or_first_listed"} has_temperature=${!!hasT} has_humidity=${!!hasH}`,
          );
        }
      }
    }
  }

  const b64 = (process.env.ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64 || "").trim();
  if (!b64) {
    console.log("ED25519_SMOKE=SKIP reason=missing_ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64");
    return;
  }
  try {
    const pem = Buffer.from(b64, "base64").toString("utf8");
    const priv = crypto.createPrivateKey(pem);
    const pubDer = crypto.createPublicKey(priv).export({ type: "spki", format: "pem" });
    const body = {
      schema: "env_collector_ingest_v1",
      userId: (process.env.CIV_USER_ID || "20260414-ITHL-Herc-Labo-ratoryOS").trim(),
      capturedAt: new Date().toISOString(),
      readings: [{ deviceId: "smoke-device", measurements: { temperatureC: 20 } }],
    };
    const ts = Date.now().toString();
    const payload = `${ts}.${canonicalJson(body)}`;
    const sig = crypto.sign(null, Buffer.from(payload, "utf8"), priv).toString("base64");
    const ok = crypto.verify(null, Buffer.from(payload, "utf8"), crypto.createPublicKey(pubDer), Buffer.from(sig, "base64"));
    console.log(`ED25519_SIGN_VERIFY=${ok ? "PASS" : "FAIL"} detail=local_roundtrip`);
    const pubEnv = (process.env.ENV_COLLECTOR_PUBLIC_KEY || "").trim();
    if (pubEnv) {
      const ok2 = crypto.verify(null, Buffer.from(payload, "utf8"), crypto.createPublicKey(pubEnv), Buffer.from(sig, "base64"));
      console.log(`ED25519_ENV_PUBLIC_MATCH=${ok2 ? "PASS" : "FAIL"}`);
    } else {
      console.log("ED25519_ENV_PUBLIC_MATCH=SKIP reason=missing_ENV_COLLECTOR_PUBLIC_KEY");
    }
  } catch (e) {
    console.log(`ED25519_SMOKE=FAIL error=${e.message.split("\n")[0].slice(0, 80)}`);
  }
})();
