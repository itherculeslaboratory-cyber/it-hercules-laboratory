# Wave B（context）ScreenDef差分 v1 DRAFT

> ステータス: PW-3 ScreenDef差分

---

## `obs.context` 差分

- `domain_tabs`: 2種から 5種（biological/artifact/digital/environment/custom）へ拡張。
- `target_picker`: 固定種リストからドメイン別カタログへ変更。
- `context_chip`: `species + domain` に `target_id` を追加表示。
- `apply`: `/observation/input` への遷移クエリへ `target_id` を追加。

## testid 追加/維持

- 維持: `obs-tgt-search-input`, `obs-tgt-tree-node`, `obs-ctx-confirm`
- 追加: `obs-tgt-domain-artifact`, `obs-tgt-domain-digital`, `obs-tgt-domain-custom`

