"""Shared ver2 UAT seed payloads — 20+ schema-valid measurement rows."""

from __future__ import annotations

from typing import Any

SPECIES = "Dynastes hercules hercules"
DISPLAY_NAME = "ver2-UAT-20rows"


def build_measurement_rows() -> list[dict[str, str]]:
    """22 rows — dictionary enum names + batch_note custom lines."""
    standard: list[dict[str, str]] = [
        {"item": "体長", "value": "78.5", "unit": "mm", "method": "manual_entry"},
        {"item": "胸幅", "value": "42.3", "unit": "mm", "method": "manual_entry"},
        {"item": "角長", "value": "55.0", "unit": "mm", "method": "manual_entry"},
        {"item": "体重", "value": "16.82", "unit": "g", "method": "manual_entry"},
        {"item": "頭幅", "value": "12.1", "unit": "mm", "method": "manual_entry"},
        {"item": "elytra_length_mm", "value": "45.0", "unit": "mm", "method": "manual_entry"},
        {"item": "産卵数", "value": "0", "unit": "個", "method": "manual_entry"},
        {"item": "幼虫体重", "value": "12.4", "unit": "g", "method": "manual_entry"},
        {"item": "温度", "value": "24.0", "unit": "°C", "method": "manual_entry"},
        {"item": "湿度", "value": "65", "unit": "%", "method": "manual_entry"},
        {"item": "co2", "value": "420", "unit": "ppm", "method": "manual_entry"},
        {"item": "pre_molt_flag", "value": "0", "unit": "", "method": "manual_entry"},
    ]
    custom_notes: list[dict[str, str]] = [
        {"item": "備考", "value": "前脚長: 34.6 mm", "unit": "", "method": "manual_entry"},
        {"item": "備考", "value": "後脚長: 38.2 mm", "unit": "", "method": "manual_entry"},
        {"item": "備考", "value": "前翅幅: 28.4 mm", "unit": "", "method": "manual_entry"},
        {"item": "備考", "value": "触角長: 9.8 mm", "unit": "", "method": "manual_entry"},
        {"item": "備考", "value": "右角曲率: 12.5°", "unit": "", "method": "manual_entry"},
        {"item": "備考", "value": "左角曲率: 11.8°", "unit": "", "method": "manual_entry"},
        {"item": "備考", "value": "前胸板幅: 18.2 mm", "unit": "", "method": "manual_entry"},
        {"item": "備考", "value": "腹節数: 6", "unit": "", "method": "manual_entry"},
        {"item": "備考", "value": "マット深さ: 15 cm", "unit": "", "method": "manual_entry"},
        {"item": "備考", "value": "カスタム計測A: 101 pt", "unit": "", "method": "manual_entry"},
    ]
    return [*standard, *custom_notes]


def build_commit_body(*, with_photo: bool, photo_data_url: str | None = None) -> dict[str, Any]:
    body: dict[str, Any] = {
        "species": SPECIES,
        "sex": "male",
        "stage_name": "adult",
        "display_name": DISPLAY_NAME,
        "rows": build_measurement_rows(),
        "photo_conditions": [
            {"item": "照明", "value": "自然光（窓際）", "method": "manual_entry"},
            {"item": "背景", "value": "白紙", "method": "manual_entry"},
            {"item": "カメラ距離", "value": "30", "unit": "cm", "method": "manual_entry"},
            {"item": "色補正", "value": "なし", "method": "manual_entry"},
        ],
        "devices": [
            {
                "device_id": "dev_uat_20rows_01",
                "role": "temp_humidity",
                "source": "manual_entry",
                "linked_measurement_names": ["温度", "湿度"],
            }
        ],
        "environment_snapshot": {
            "temperature_c": "23.8",
            "humidity_pct": "58",
            "source": "manual_entry",
        },
    }
    if with_photo and photo_data_url:
        body["has_photo"] = True
        body["photo_data_url"] = photo_data_url
    return body
