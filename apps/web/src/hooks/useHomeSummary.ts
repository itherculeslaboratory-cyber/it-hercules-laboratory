"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

export interface HomeSummary {
  today_lines: string[];
  cards: { id: string; label: string; value: string; href: string }[];
  primary_cta: { label: string; href: string };
  source: "api" | "local-stub";
}

const LOCAL_HOME_SUMMARY: HomeSummary = {
  today_lines: [
    "観測セッション 3 件が確認待ちです",
    "最新の個体 QR から入力を再開できます",
    "本日の重要導線: 観測入力と掲示板確認",
  ],
  cards: [
    { id: "obs", label: "観測検索", value: "12", href: "/observation" },
    { id: "market", label: "マーケット出品", value: "4", href: "/market" },
    { id: "board", label: "掲示板未読", value: "7", href: "/board" },
    { id: "qr", label: "QR再開候補", value: "2", href: "/scan" },
    { id: "templates", label: "テンプレ数", value: "5", href: "/observation/templates" },
  ],
  primary_cta: { label: "観測登録開始", href: "/observation/context" },
  source: "local-stub",
};

export function useHomeSummary() {
  const [data, setData] = useState<HomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<HomeSummary>("/api/v1/home/summary");
      setData(res);
    } catch (e) {
      setData(LOCAL_HOME_SUMMARY);
      setError(e instanceof ApiError ? e.message : "ホーム API が未接続のためローカル表示");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
