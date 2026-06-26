"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function PhotoAnalysisPage() {
  const [data, setData] = useState<{
    tags: { tag: string; confidence: number }[];
    capture_conditions: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    api
      .get<typeof data>("/api/v1/photo-analysis/result")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageColumn><StatePanel kind="loading" title="解析結果を読み込み中" /></PageColumn>;
  if (error || !data) return <PageColumn><StatePanel kind="error" title="表示できません" description={error ?? undefined} /></PageColumn>;

  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">写真解析結果</h1>
        <p className="text-sm text-civ-muted">{data.capture_conditions}</p>
        <Card>
          <CardTitle>タグ提案</CardTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.tags.map((t) => (
              <Badge key={t.tag} tone="info">
                {t.tag} ({(t.confidence * 100).toFixed(0)}%)
              </Badge>
            ))}
          </div>
          <Button
            variant="primary"
            className="mt-6"
            disabled={approved}
            onClick={async () => {
              try {
                await api.post("/api/v1/photo-analysis/approve", {
                  capture_id: "cap_demo_a",
                  tags: data.tags,
                });
                setApproved(true);
              } catch (e) {
                setError(e instanceof ApiError ? e.message : "承認に失敗しました");
              }
            }}
          >
            タグを承認
          </Button>
          {approved ? <p className="text-sm text-civ-success mt-2">承認しました（Truth に記録）</p> : null}
        </Card>
      </Stack>
    </PageColumn>
  );
}
