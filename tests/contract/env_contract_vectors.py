"""Contract vectors extracted from civ-os (salvage-adapt only — no bulk copy).

Sources:
- backend/src/logic/envCollectorIngest.ts
- backend/src/__tests__/envCollectorIngest.test.ts
- backend/src/__tests__/switchbotClient.test.ts
- backend/src/__tests__/envShelfRoutes.test.ts (occupancy 409)
- 13-データ取得元-実装設計-v1.md §3 · §8.2 (IHL header/path adaptations)
"""

from __future__ import annotations

from typing import Any

# civ-os envCollectorIngest.test.ts — sanitized local collector body (IHL: actor_id TBD)
COLLECTOR_INGEST_BODY_V1: dict[str, Any] = {
    "schema": "env_collector_ingest_v1",
    "userId": "u_collector",
    "capturedAt": "2026-06-10T03:00:00.000Z",
    "placementId": "pl_1234567890abcdef1234567890abcdef",
    "readings": [
        {
            "deviceId": "meter-local-1",
            "measurements": {
                "temperatureC": 24.5,
                "humidityPct": 51,
                "co2Ppm": 720,
                "batteryPct": 99,
            },
        },
    ],
}

# Allowed sanitized measurement columns per 13-実装設計 §2
ALLOWED_TELEMETRY_COLUMNS = frozenset(
    {
        "temperatureC",
        "humidityPct",
        "co2Ppm",
        "lightLevel",
        "batteryPct",
        "placementId",
        "annotationId",
        "deviceId",
        "capturedAt",
        "source",
        "measurement_method",
    }
)

# civ-os switchbotClient.test.ts — Meter status body shapes
SWITCHBOT_METER_STATUS_STRING_BODY = {
    "statusCode": 100,
    "body": {"deviceId": "m1", "temperature": "23.5", "humidity": 51},
}

SWITCHBOT_METER_STATUS_FLAT = {"temperatureC": 20, "humidityPct": 40}

# SwitchBot Hub 3 — lightLevel discrete scale 1–10 (ADR-H-35 · not lux)
SWITCHBOT_HUB3_STATUS_WITH_LIGHT = {
    "statusCode": 100,
    "body": {
        "deviceId": "hub3-7e",
        "deviceType": "Hub 3",
        "temperature": 22.0,
        "humidity": 45,
        "lightLevel": 7,
    },
}

# IHL ingest headers (design §3.1 — civ-os X-Civilization-* → X-IHL-*)
IHL_COLLECTOR_HEADERS = (
    "X-IHL-Collector-Id",
    "X-IHL-Collector-Timestamp",
    "X-IHL-Collector-Signature",
)

# Tier B natural key (ADR-H-19 / 13-実装設計 §8.2)
TIER_B_BUCKET_SEC = 300
