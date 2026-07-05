import type { W2ComponentProps } from "../../../types/w2";
import type { ScreenFeatureConfig } from "./types";

/** walkthrough.js + screen-def transitions 正本 */
export const SCREEN_CONFIGS: Record<string, ScreenFeatureConfig> = {
  "07a": {
    title: "掲示板ハブ",
    breadcrumb: "掲示板 › ハブ",
    lead: "カテゴリを選んでスレッドへ進みます。",
    layout: "hub",
    items: [
      { hotspot: "hotspot.0", label: "改善提案", hint: "機能改善の提案スレッド" },
      { hotspot: "hotspot.1", label: "愚痴板", hint: "気軽な愚痴・雑談" },
      { hotspot: "hotspot.2", label: "論文板", hint: "論文執筆・査読" },
      { hotspot: "hotspot.3", label: "その他板", hint: "その他カテゴリ" },
      { hotspot: "hotspot.4", label: "コンポ掲示板", hint: "コンポーネント開発" },
    ],
  },
  "07b": {
    title: "改善提案",
    breadcrumb: "掲示板 › 改善提案",
    layout: "thread",
    items: [
      { hotspot: "hotspot.0", label: "… › 指摘", hint: "争い部屋へ" },
      { hotspot: "hotspot.1", label: "ハブへ", hint: "掲示板ハブ" },
    ],
    primaryLabel: "返信する",
    primaryHotspot: "hotspot.0",
  },
  "07o": {
    title: "その他板",
    breadcrumb: "掲示板 › その他",
    layout: "thread",
    items: [{ hotspot: "hotspot.0", label: "ハブへ", hint: "掲示板ハブ" }],
    primaryLabel: "新規投稿",
    primaryHotspot: "hotspot.1",
  },
  "07g": {
    title: "愚痴板",
    breadcrumb: "掲示板 › 愚痴",
    layout: "thread",
    items: [{ hotspot: "hotspot.0", label: "ハブへ", hint: "掲示板ハブ" }],
    primaryLabel: "愚痴を書く",
  },
  "19board": {
    title: "コンポーネント掲示板",
    breadcrumb: "掲示板 › コンポーネント掲示板",
    layout: "thread",
    items: [
      { hotspot: "hotspot.0", label: "GitHub issue #142", hint: "スレッド詳細" },
      { hotspot: "hotspot.1", label: "file-board", hint: "ファイル板" },
      { hotspot: "hotspot.2", label: "掲示板ハブ", hint: "07a" },
      { hotspot: "hotspot.3", label: "ホーム", hint: "01" },
    ],
  },
  "12hub": {
    title: "設定",
    breadcrumb: "設定",
    layout: "hub",
    items: [
      { hotspot: "hotspot.0", label: "PII・プライバシー", hint: "個人情報の管理" },
      { hotspot: "hotspot.1", label: "機器管理", hint: "デバイス登録" },
      { hotspot: "hotspot.2", label: "UI テンプレ選択", hint: "世界観テンプレ" },
    ],
  },
  "12pii": {
    title: "PII・プライバシー",
    breadcrumb: "設定 › PII",
    layout: "form",
    lead: "公開範囲と個人情報の取り扱いを設定します。",
    items: [{ hotspot: "hotspot.0", label: "設定ハブ", hint: "12hub" }],
    primaryLabel: "保存する",
  },
  "13": {
    title: "機器管理",
    breadcrumb: "設定 › 機器",
    layout: "form",
    items: [
      { hotspot: "hotspot.0", label: "観測入力へ", hint: "05i" },
      { hotspot: "hotspot.1", label: "設定ハブ", hint: "12hub" },
    ],
  },
  "17picker": {
    title: "UI テンプレ選択",
    breadcrumb: "設定 › UI テンプレ選択",
    layout: "hub",
    items: [
      { hotspot: "hotspot.0", label: "おすすめタブ", hint: "タブ切替" },
      { hotspot: "hotspot.1", label: "テンプレカード", hint: "選択" },
      { hotspot: "hotspot.2", label: "適用する", hint: "01 へ" },
      { hotspot: "hotspot.3", label: "Builder", hint: "16" },
      { hotspot: "hotspot.4", label: "設定ハブ", hint: "12hub" },
    ],
    primaryLabel: "適用する",
    primaryHotspot: "hotspot.2",
  },
  PR: {
    title: "プロフィール",
    breadcrumb: "プロフィール",
    layout: "metrics",
    items: [
      { hotspot: "hotspot.0", label: "通知", hint: "Q&A・称賛・オファー" },
      { hotspot: "hotspot.1", label: "カルマ", hint: "08 詳細" },
      { hotspot: "hotspot.2", label: "貢献度", hint: "14 バッジ" },
    ],
  },
  PRnotif: {
    title: "マイページ 通知",
    breadcrumb: "マイページ › 通知",
    layout: "thread",
    items: [
      { hotspot: "hotspot.0", label: "プロフィールへ", hint: "PR" },
      { hotspot: "hotspot.1", label: "マーケットへ", hint: "06a" },
    ],
  },
  "08": {
    title: "カルマ概要",
    breadcrumb: "プロフィール › カルマ",
    layout: "metrics",
    lead: "行動履歴に基づくカルマスコアの概要です。",
    items: [
      { hotspot: "hotspot.0", label: "免罪符ショップ", hint: "22 PTショップ" },
      { hotspot: "hotspot.1", label: "プロフィール", hint: "PR" },
    ],
  },
  "14": {
    title: "貢献度",
    breadcrumb: "貢献度",
    layout: "metrics",
    items: [
      { hotspot: "hotspot.0", label: "PTショップ", hint: "22" },
      { hotspot: "hotspot.1", label: "一般投票", hint: "20vote" },
      { hotspot: "hotspot.2", label: "プロフィール", hint: "PR" },
    ],
  },
  "22": {
    title: "PT ショップ",
    breadcrumb: "経済 › PTショップ",
    layout: "shop",
    items: [
      { hotspot: "hotspot.0", label: "貢献度へ", hint: "14" },
      { hotspot: "hotspot.1", label: "一般投票へ", hint: "20vote" },
    ],
    primaryLabel: "購入する",
  },
  "10": {
    title: "好み pairwise",
    breadcrumb: "好み",
    layout: "pairwise",
    items: [
      { hotspot: "hotspot.0", label: "プレビュー帯", hint: "好み反映" },
      { hotspot: "hotspot.1", label: "ホーム", hint: "01" },
    ],
    primaryLabel: "次のペア",
    primaryHotspot: "hotspot.0",
  },
  "11": {
    title: "争い 二人部屋",
    breadcrumb: "掲示板 › 争い",
    layout: "dispute",
    items: [{ hotspot: "hotspot.0", label: "掲示板へ", hint: "07b" }],
  },
  "20vote": {
    title: "一般投票",
    breadcrumb: "投票 › 一般投票（2026-Q2）",
    layout: "vote",
    items: [
      { hotspot: "hotspot.0", label: "候補 A", hint: "選択" },
      { hotspot: "hotspot.1", label: "投票する", hint: "確定" },
      { hotspot: "hotspot.2", label: "免罪符ショップ", hint: "22" },
      { hotspot: "hotspot.3", label: "ホーム", hint: "01" },
    ],
    primaryLabel: "投票する",
    primaryHotspot: "hotspot.1",
  },
  "16": {
    title: "UIビルダー",
    breadcrumb: "Builder",
    layout: "builder-entry",
    items: [
      { hotspot: "hotspot.0", label: "入口例", hint: "16e" },
      { hotspot: "hotspot.1", label: "UI テンプレ選択", hint: "17picker" },
      { hotspot: "hotspot.2", label: "写真解析", hint: "18photo" },
    ],
  },
  "16e": {
    title: "この画面を編集",
    breadcrumb: "Builder 入口",
    layout: "builder-entry",
    lead: "右下の「この画面を編集」から Builder に入ります。",
    items: [{ hotspot: "hotspot.0", label: "Builder", hint: "16" }],
    primaryLabel: "Builder を開く",
    primaryHotspot: "hotspot.0",
  },
};

/** component_id プレフィックス → 設定 screenId（共有部品用） */
export const COMPONENT_SCREEN_MAP: Record<string, string | ((screenId?: string) => string)> = {
  "ihl-07-board-hub": "07a",
  "ihl-07-board-thread-post": (sid) => (sid === "07o" ? "07o" : "07b"),
  "ihl-07-board-post---": "07g",
  "ihl-19-component-board": "19board",
  "ihl-12-settings-hub": "12hub",
  "ihl-12-settings-pii": "12pii",
  "ihl-17-world-template-picker": "17picker",
  "ihl-profile-three-metrics": (sid) => (sid === "PRnotif" ? "PRnotif" : "PR"),
  "ihl-08-karma-summary": "08",
  "ihl-14-contribution-badge": "14",
  "ihl-22-pt-shop": "22",
  "ihl-10-preference-pairwise": "10",
  "ihl-11-dispute-tworoom": "11",
  "ihl-20-vote-general": "20vote",
  "ihl-16-edit-this-screen-entry": "16e",
};

export function resolveConfig(componentId: string, screenId?: string): ScreenFeatureConfig | null {
  if (componentId.startsWith("ihl-13-device-registry")) {
    return SCREEN_CONFIGS["13"] ?? null;
  }
  if (componentId.startsWith("ihl-16-uibuilder-canvas")) {
    return SCREEN_CONFIGS["16"] ?? null;
  }

  for (const [prefix, key] of Object.entries(COMPONENT_SCREEN_MAP)) {
    if (componentId.startsWith(prefix)) {
      const configKey = typeof key === "function" ? key(screenId) : key;
      return SCREEN_CONFIGS[configKey] ?? null;
    }
  }
  return null;
}

export function fireHotspot(onAction: W2ComponentProps["onAction"], hotspot: string) {
  onAction?.(hotspot);
}
