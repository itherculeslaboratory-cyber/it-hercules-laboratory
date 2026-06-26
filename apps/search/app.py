"""Phase 1 Streamlit search UI — 5 pane: filter → grid → detail → similar → tag.

Design ref: ``指示/.../02-設計/_ui-global/05-観測-Streamlit.md`` · ``ADR-Phase1-OSS選定表.md``.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import streamlit as st

from libs.query import ALLOWED_FILTERS, QueryValidationError, count_captures, search_captures
from libs.r2_io import R2Client, default_local_root
from libs.scoring import SimilarHit, search_similar

st.set_page_config(page_title="IHL Search", layout="wide")
st.title("IT Hercules Laboratory — 観測検索")
st.caption("Phase 1 · filter → grid → detail → similar → tag · 色補正なし")


@st.cache_data(show_spinner=False)
def _load_pointer(pointer_path: str) -> dict[str, Any]:
    return json.loads(Path(pointer_path).read_text(encoding="utf-8"))


def _resolve_data_sources() -> tuple[Path | None, Path | None]:
    env_parquet = os.environ.get("IHL_SEARCH_PARQUET", "").strip()
    if env_parquet:
        candidate = Path(env_parquet).resolve()
        if candidate.is_file():
            locator = candidate.parent / candidate.name.replace(
                "searchable_capture_set", "embedding_locator"
            )
            loc_path = locator if locator.is_file() else None
            return candidate, loc_path

    pointer = default_local_root() / "snapshots" / "latest_pointer.json"
    if pointer.is_file():
        doc = _load_pointer(str(pointer))
        searchable = doc.get("searchable_parquet")
        locator = doc.get("embedding_locator_parquet")
        s_path = Path(str(searchable)) if searchable else None
        l_path = Path(str(locator)) if locator else None
        if s_path and s_path.is_file():
            return s_path, l_path if l_path and l_path.is_file() else None

    r2 = R2Client()
    keys = r2.list_keys("snapshots/", max_keys=100)
    parquet_keys = sorted(k for k in keys if k.endswith(".parquet") and "searchable" in k)
    if parquet_keys:
        local = default_local_root() / parquet_keys[-1]
        if local.is_file():
            loc_name = local.name.replace("searchable_capture_set", "embedding_locator")
            loc_local = local.parent / loc_name
            return local, loc_local if loc_local.is_file() else None

    return None, None


def _init_session() -> None:
    if "selected_capture_id" not in st.session_state:
        st.session_state.selected_capture_id = None
    if "similar_hits" not in st.session_state:
        st.session_state.similar_hits: list[SimilarHit] = []


def _render_thumbnail(path_str: str | None, *, caption: str) -> None:
    if path_str and Path(path_str).is_file():
        st.image(path_str, caption=caption, use_container_width=True)
    else:
        st.caption(f"{caption}（画像パスなし）")


def main() -> None:
    _init_session()
    parquet_path, locator_path = _resolve_data_sources()

    with st.sidebar:
        st.header("① フィルタ")
        species = st.text_input("種 (species)", value="")
        sex = st.selectbox("性別 (sex)", ["", "male", "female", "unknown"])
        stage = st.text_input("ステージ (stage_name)", value="")
        view = st.text_input("視点 (view_type)", value="")
        limit = st.number_input("表示件数", min_value=1, max_value=200, value=24)
        st.divider()
        st.caption("query whitelist · DuckDB 等値フィルタ")

    if parquet_path is None:
        st.warning(
            "検索用 Parquet が見つかりません。"
            " ``scripts/run-pipeline.py`` でパイプラインを実行するか、"
            " ``IHL_SEARCH_PARQUET`` を指定してください。",
            icon="⚠️",
        )
        st.stop()

    try:
        total = count_captures(parquet_path)
    except FileNotFoundError:
        st.error("Parquet ファイルを読み込めません。")
        st.stop()

    filters: dict[str, str] = {}
    if species.strip():
        filters["species"] = species.strip()
    if sex:
        filters["sex"] = sex
    if stage.strip():
        filters["stage_name"] = stage.strip()
    if view.strip():
        filters["view_type"] = view.strip()

    unknown_filters = set(filters) - ALLOWED_FILTERS
    if unknown_filters:
        st.error(f"許可されていないフィルタ: {sorted(unknown_filters)}")
        st.stop()

    grid_columns = [
        "capture_id",
        "individual_id",
        "species",
        "sex",
        "stage_name",
        "view_type",
        "thumbnail_path",
        "image_path",
        "capture_timestamp",
    ]

    try:
        rows = search_captures(
            parquet_path,
            columns=grid_columns,
            filters=filters or None,
            limit=int(limit),
        )
    except QueryValidationError as exc:
        st.error(str(exc))
        st.stop()
    except FileNotFoundError:
        st.error("Parquet ファイルを読み込めません。")
        st.stop()

    st.success(f"データ: `{parquet_path.name}` · 全 {total} 件", icon="✅")
    st.metric("② グリッド一致件数", len(rows))

    st.subheader("② 結果グリッド")
    if not rows:
        st.info("条件に合う個体がありません。フィルタを緩めてください。", icon="ℹ️")
    else:
        cols_per_row = 4
        for start in range(0, len(rows), cols_per_row):
            cols = st.columns(cols_per_row)
            for col, row in zip(cols, rows[start : start + cols_per_row], strict=False):
                with col:
                    cap = (
                        f"{row.get('species', '')} · {row.get('sex', '')} · "
                        f"{row.get('stage_name', '')}"
                    )
                    _render_thumbnail(row.get("thumbnail_path"), caption=cap)
                    if st.button("選択", key=f"pick_{row['capture_id']}", use_container_width=True):
                        st.session_state.selected_capture_id = str(row["capture_id"])
                        st.session_state.similar_hits = []

    selected_id = st.session_state.selected_capture_id
    selected_row = next((r for r in rows if r["capture_id"] == selected_id), None)

    st.divider()
    detail_col, similar_col = st.columns(2)

    with detail_col:
        st.subheader("③ 個体詳細")
        if not selected_id:
            st.info("グリッドから個体を選択してください。")
        elif selected_row is None:
            st.warning("選択した個体は現在のフィルタ結果に含まれていません。")
        else:
            _render_thumbnail(
                selected_row.get("image_path") or selected_row.get("thumbnail_path"),
                caption=str(selected_row["capture_id"]),
            )
            st.caption("撮影条件: 色補正なし · 生写真をそのまま表示")
            st.table(
                {
                    "項目": ["capture_id", "individual_id", "species", "sex", "stage", "view"],
                    "値": [
                        selected_row.get("capture_id"),
                        selected_row.get("individual_id"),
                        selected_row.get("species"),
                        selected_row.get("sex"),
                        selected_row.get("stage_name"),
                        selected_row.get("view_type"),
                    ],
                }
            )

    with similar_col:
        st.subheader("④ 類似検索")
        if not selected_id:
            st.info("個体を選択すると類似検索できます。")
        elif locator_path is None:
            st.warning("embedding_locator Parquet がありません。パイプラインを完走してください。")
        else:
            if st.button("類似を検索", type="primary", use_container_width=True):
                try:
                    st.session_state.similar_hits = search_similar(
                        selected_id,
                        searchable_parquet=parquet_path,
                        locator_parquet=locator_path,
                        filters=filters or None,
                        top_k=5,
                    )
                except (KeyError, ValueError, FileNotFoundError) as exc:
                    st.error(f"類似検索できませんでした: {exc}")

            hits: list[SimilarHit] = st.session_state.similar_hits
            if not hits:
                st.caption("〔類似を検索〕で embedding cosine + rerank を実行")
            else:
                for hit in hits:
                    meta = hit.metadata
                    label = (
                        f"{meta.get('species', '')} · score {hit.score:.2f}"
                    )
                    st.progress(min(max(hit.score, 0.0), 1.0), text=label)
                    _render_thumbnail(meta.get("thumbnail_path"), caption=hit.capture_id)

    st.divider()
    st.subheader("⑤ タグ追加")
    if not selected_id:
        st.info("個体を選択するとタグを追加できます（Phase 1 は記録スタブ）。")
    else:
        tag_text = st.text_input("タグ", placeholder="例: 優良個体")
        if st.button("タグを記録（スタブ）", disabled=not tag_text.strip()):
            st.success(
                f"タグ `{tag_text.strip()}` を capture `{selected_id}` に追記予定"
                "（``tag_aggregator`` · append-only JSONL · Phase 2 本配線）"
            )


if __name__ == "__main__":
    main()
