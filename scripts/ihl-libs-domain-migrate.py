#!/usr/bin/env python3
"""One-shot libs/ → libs/ihl/<domain>/ migration with backward-compat shims."""

from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIBS = ROOT / "libs"
IHL = LIBS / "ihl"

DOMAIN_MODULES: dict[str, list[str]] = {
    "core": [
        "catalog",
        "domain_catalog",
        "event_store",
        "r2_io",
        "schema_validator",
    ],
    "observation": [
        "embedding",
        "faiss_index",
        "image",
        "measurement_template_catalog",
        "query",
        "scoring",
        "solid_commit",
    ],
    "economy": ["economy_logic", "market_state"],
    "env": [
        "collector_ingest",
        "device_registry",
        "env_telemetry",
        "placement_store",
        "switchbot_client",
    ],
    "governance": ["board_store", "github_component_board", "pii"],
    "payments": [
        "gmo_connector",
        "gmo_connector_stub",
        "gmo_reconciliation_store",
        "gmo_transfer_code",
        "gmo_webhook_client",
        "gmo_webhook_security",
    ],
    "i18n": ["i18n_catalog"],
    "identity": ["auth_session", "preferences_store"],
    "theme": ["theme_pack"],
}

DOMAIN_README: dict[str, str] = {
    "core": "event_store · r2_io · schema_validator · catalog · domain_catalog",
    "observation": "query · scoring · embedding · image · faiss_index · solid_commit · measurement_template_catalog",
    "economy": "economy_logic · market_state",
    "env": "switchbot_client · placement_store · device_registry · collector_ingest · env_telemetry",
    "governance": "board_store · github_component_board · pii",
    "payments": "gmo_connector · gmo_* webhook/reconciliation/transfer",
    "i18n": "i18n_catalog",
    "identity": "auth_session · preferences_store",
    "theme": "theme_pack",
}


def shim_content(domain: str, module: str) -> str:
    return f'''"""DEPRECATED shim — import from libs.ihl.{domain}.{module} instead."""

import sys

import libs.ihl.{domain}.{module} as _mod

sys.modules[__name__] = _mod
'''


def main() -> None:
    IHL.mkdir(parents=True, exist_ok=True)
    (IHL / "__init__.py").write_text(
        '"""IHL domain packages — see libs/ihl/<domain>/README.md."""\n',
        encoding="utf-8",
    )

    for domain, modules in DOMAIN_MODULES.items():
        domain_dir = IHL / domain
        domain_dir.mkdir(parents=True, exist_ok=True)
        readme = domain_dir / "README.md"
        if not readme.exists():
            readme.write_text(
                f"# libs/ihl/{domain}/\n\n"
                f"Domain package — **{DOMAIN_README[domain]}**.\n\n"
                f"> Layout: [`docs/design/OSS-REPO-LAYOUT-v1.md`](../../docs/design/OSS-REPO-LAYOUT-v1.md)\n",
                encoding="utf-8",
            )
        init_py = domain_dir / "__init__.py"
        if not init_py.exists():
            init_py.write_text(f'"""IHL {domain} domain."""\n', encoding="utf-8")

        for name in modules:
            src = LIBS / f"{name}.py"
            dst = domain_dir / f"{name}.py"
            shim = LIBS / f"{name}.py"
            if not src.is_file():
                if dst.is_file():
                    continue
                raise SystemExit(f"missing source: {src}")
            if dst.is_file():
                continue
            shutil.move(str(src), str(dst))
            shim.write_text(shim_content(domain, name), encoding="utf-8")
            print(f"moved {name}.py -> ihl/{domain}/ + shim")


if __name__ == "__main__":
    main()
