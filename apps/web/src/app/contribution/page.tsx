"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function ContributionPage() {
  const [data, setData] = useState<{
    total: number;
    platinum_balance: number;
    badges: { id: string; label: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<typeof data>("/api/v1/contribution")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageColumn><StatePanel kind="loading" title="読み込み中" /></PageColumn>;
  if (error || !data) return <PageColumn><StatePanel kind="error" title="表示できません" description={error ?? undefined} /></PageColumn>;

  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">マイ貢献度</h1>
        <Card>
          <CardTitle>合計貢献度</CardTitle>
          <p className="text-3xl mt-2">{data.total}</p>
          <p className="text-sm text-civ-muted mt-2">プラチナ残高: {data.platinum_balance} PT</p>
        </Card>
        <div className="flex flex-wrap gap-2">
          {data.badges.map((b) => (
            <Badge key={b.id} tone="success">{b.label}</Badge>
          ))}
        </div>
      </Stack>
    </PageColumn>
  );
}
