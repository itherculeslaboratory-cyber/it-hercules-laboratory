# 06 マーケット — LAB Design Note v2

> **日付**: 2026-07-05  
> **前版**: [`06-マーケット-LAB-DESIGN-NOTE-v1.md`](./06-マーケット-LAB-DESIGN-NOTE-v1.md)  
> **self-audit**: [`sessions/06-マーケット-SELF-AUDIT-FIXES-v1.md`](./sessions/06-マーケット-SELF-AUDIT-FIXES-v1.md)

---

## v1 → v2 oracle 変更

| 項目 | v1 | v2（self-audit 後） |
|------|-----|---------------------|
| タブ順 | 出品/オークション/**テンプレ**/抽選/優先順 | 出品/オークション/**抽選/優先順/テンプレ**（catalog 同型） |
| browse 深い導線 | MarketDeepNav + footer 二重 | **削除** · W2ShellOnly 標準フッタのみ |
| state 表示 | StatePanel のみ | **ContentArea + partState URL 同期** |
| Stage3 評価 UX | 完了表示と入力が同時 | **確定前=入力 · 確定後=8%+GMO** |
| Stage3 主CTA | 常時 null または常時表示 | **評価確定後・GMO前のみ**「振込案内を確認」 |
| 未ログイン | 未実装 | **`?guest=1`** でログインゲート |
| 抽選落選 | redirect → list | **`lotteryStep=lose`** inline |

Charter Q1–Q4 は **変更なし**（Q2:A タブ統合 · Q3:C stepper · Q4:A GMO インライン）。

---

## 残ギャップ（正直 · v2）

| # | 内容 | 優先 |
|---|------|------|
| R1 | 貢献度バッジ — 専用コンポーネント未接続（テキスト/chip stub） | SHOULD |
| R2 | `06list` 新規出品 W2 未着手 | Wave B |
| R3 | 未ログイン — W2PartState に `guest` なし · URL param  workaround | lab 限定的 |
| R4 | 争い導線 Y09 — lab スコープ外 | 設計ゲート後 |
| R5 | 設計 doc 草案 — 人間目視レビュー待ち | 人間 gate |

---

## テスト導線（更新）

```text
/s/06a — タブ順: 出品|オークション|抽選|優先順|テンプレ
/s/06a?tab=lottery → 当選 → /s/06b（≤3 hop）
/s/06b → stage=2 → stage=3?eval=submitted → GMO ?gmo=done
/s/06b?guest=1 — ログインゲート
StatePanel トグル → ?partState=loading|empty|error — ContentArea 連動
/s/23 → redirect /s/06b?stage=3
```

---

*v2 · self-audit 後 oracle 更新*
