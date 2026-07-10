# HANDOFF: ver3 Phase C(実装)キックオフ

> 作成: 2026-07-10(Phase B 完走セッション)。Phase B は B1〜B8 全完了・保留ゼロ・main マージ済み。
> 自律ラン既定契約(批評家ゲート・事後承認・commit/push 可 等)はグローバル CLAUDE.md に固定済み — キックオフ本文への再記述不要。

## 読む順(C0 セッション冒頭)

1. `b3/ver3-開発計画-v1.md` — **§3 マイルストーン C0〜C6・§9 Phase C 開始条件**(正本)
2. `b3/ver3-ワークスペース設計-v1.md` — D:\claude HQ 階層と**記憶引っ越しチェックリスト**(C0 で実行)
3. `b3/ver3-新repoフォルダ設計-v1.md` — 新 repo 初期化チェックリスト(§8)・継承マップ(§6)
4. `b2/README.md` — 技術選定8本の確定(384 / Workers+Hono / Resend / VOICEVOX / ruri-v3-70m)
5. `b4/` 設計書3種(実装契約は AI用 §1〜§12)

## C0 の作業(開発計画 §3 の C0 定義が正)

1. ワークスペース移行(コピー→検証→退役方式): 現 repo → `D:\claude\systems\ihl-ver2`、記憶 slug コピー、絶対パス更新、git remote 不変確認、ロールバック手順確保
2. 新 repo `it-hercules-laboratory_ver3` を `D:\claude\systems\ihl-ver3` に初期化(フォルダ設計 §8 の11手順)
3. **GMO sunabar 実証**(開発キーはユーザーがローカル格納済み — 所在を尋ねる。値のコミット絶対禁止)
4. B2 選定の再検証条項の確認(料金・制限の変動チェック)

## 注意

- D:\notes は移さない(ワークスペース設計 案B)
- 互換必須13レイヤーの negative TC を最優先で緑化(開発計画 §5)
- 自動運転スケジューラは実装済み・enabled=false(`/night-run` で操作。memory: autorun-scheduler)
- B1 英語版(final-requirements.en.md)は別セッションで実施予定 — 未完なら Phase C と独立に進めてよい
