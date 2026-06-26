# 18 写真解析 — UI 設計 v1

> **ステータス**: 草案 v1 · Batch 6 · Vision/CLIP 契約は ADR-Phase2

---

## 1. 主タスク

**「component パイプラインの解析結果を確認し、タグ提案を承認する」**

---

## 2. モック

![写真解析結果](../02-設計/_ui-global/mockups/mockups/mockups/ihl-18-photo-analysis-result.png)

---

## 3. component 分解連動

ingest → thumbnail → embedding → tag_aggregate。色補正禁止（preferences §C）。

---

## 4. 状態

loading / empty（画像なし）/ result / error（再試行）

---

*Batch 6*
