# AUDIT-FAIL — #19 コンポ掲示板

> **日付**: 2026-06-10  
> **ゲート**: [`00-監査役-設計実装伴走ゲート-v1.md`](./00-監査役-設計実装伴走ゲート-v1.md)  
> **修復キュー**: **POST-OSS-19**

---

## 設計主張（C1 PASS）

| 出典 | 主張 |
|------|------|
| `19-コンポーネント掲示板.md` | IHL 改善履歴 = **GitHub**（BOARD · Discussions · PR） |
| `19-コンポーネント掲示板-詳細設計-v1.md` | `github_discussion_url` · GitHub SSOT |
| DoD マトリクス | persistence = **GitHub 連携（非 R2 SSOT）** |

---

## 実装ギャップ（C2 FAIL）

| チェック | 実態 |
|----------|------|
| `C2-mock-store` | `apps/api/main.py` L646–651: `get_board_store()` 空時 **`get_mock_store()` フォールバック** |
| `C2-github-impl` | `libs/*.py` に **github 参照ゼロ** |

---

## テストギャップ（C3 FAIL）

| テスト | 問題 |
|--------|------|
| `test_stays_verification.py::test_component_board_stays` | **200 OK のみ** · GitHub 主張を未 assert |
| `test_board_store.py` | JSONL ミラー unit · GitHub 連携非検証 |
| `test_component_board_github.py` | **不存在** |

---

## 修復条件（POST-OSS-19 完了時）

1. GitHub connector / BOARD 索引実装（mock_store フォールバック削除）
2. `test_component_board_github.py` 等で GitHub 主張を assert
3. `ihl-design-impl-parity-check.mjs --feature 19` → **PASS**
4. 伴走ゲート証跡に設計行 + コード行 + テスト行を引用

---

*BLOCK 中 — DoD `✓` および POST-OSS-19 `[x]` 禁止*
