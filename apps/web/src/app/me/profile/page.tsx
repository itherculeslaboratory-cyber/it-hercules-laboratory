"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function ProfilePage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Record<string, unknown>>("/api/v1/profile/metrics")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageColumn><StatePanel kind="loading" title="プロフィール読み込み中" /></PageColumn>;
  if (error || !data) return <PageColumn><StatePanel kind="error" title="表示できません" description={error ?? undefined} /></PageColumn>;

  const karma = data.karma as { value: number };
  const contribution = data.contribution as { value: number; breakdown: Record<string, number> };
  const rating = data.market_rating as { value: number; review_count: number };

  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">プロフィール（3 指標）</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardDescription>カルマ</CardDescription>
            <CardTitle className="text-3xl mt-2">{karma.value}</CardTitle>
          </Card>
          <Card>
            <CardDescription>貢献度</CardDescription>
            <CardTitle className="text-3xl mt-2">{contribution.value}</CardTitle>
            <p className="text-xs text-civ-muted mt-2">
              観測 {contribution.breakdown.observation} · 論文 {contribution.breakdown.paper} · 取引 {contribution.breakdown.market}
            </p>
          </Card>
          <Card>
            <CardDescription>市場評価</CardDescription>
            <CardTitle className="text-3xl mt-2">{rating.value}</CardTitle>
            <p className="text-xs text-civ-muted mt-2">{rating.review_count} レビュー</p>
          </Card>
        </div>
      </Stack>
    </PageColumn>
  );
}
