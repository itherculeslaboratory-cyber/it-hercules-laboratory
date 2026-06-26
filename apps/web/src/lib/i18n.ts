export type Locale = "ja" | "en";

const messages: Record<Locale, Record<string, string>> = {
  ja: {
    "nav.home": "ホーム",
    "nav.observation": "観測",
    "nav.market": "マーケット",
    "nav.board": "掲示板",
    "nav.settings": "設定",
    "cta.observe": "観測をはじめる",
    "state.loading": "読み込み中",
    "state.empty": "データがありません",
    "state.error": "表示できません",
    "terms.draft": "草案",
  },
  en: {
    "nav.home": "Home",
    "nav.observation": "Observation",
    "nav.market": "Market",
    "nav.board": "Board",
    "nav.settings": "Settings",
    "cta.observe": "Start observing",
    "state.loading": "Loading",
    "state.empty": "No data",
    "state.error": "Unable to display",
    "terms.draft": "Draft",
  },
};

export function t(locale: Locale, key: string): string {
  return messages[locale][key] ?? messages.ja[key] ?? key;
}

export function detectLocale(header?: string | null): Locale {
  if (header?.toLowerCase().startsWith("en")) return "en";
  return "ja";
}
