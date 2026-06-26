"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function MatchPage() {
  const [pair, setPair] = useState<{
    pair_id: string;
    left: { capture_id: string; label: string };
    right: { capture_id: string; label: string };
  } | null>(null);
  const [status, setStatus] = useState<string>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ status: string; pair: typeof pair }>("/api/v1/match/pair")
      .then((r) => {
        setStatus(r.status);
        setPair(r.pair);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"));
  }, []);

  async function vote(chosen: "left" | "right") {
    if (!pair) return;
    await api.post("/api/v1/match/vote", { pair_id: pair.pair_id, chosen });
    setStatus("recorded");
  }

  if (error) {
    return (
      <PageColumn>
        <StatePanel kind="error" title="好みペアを表示できません" description={error} />
      </PageColumn>
    );
  }

  if (status === "loading") {
    return (
      <PageColumn>
        <StatePanel kind="loading" title="候補を読み込み中" />
      </PageColumn>
    );
  }

  if (status === "empty" || !pair) {
    return (
      <PageColumn>
        <StatePanel kind="empty" title="候補が不足しています" description="比較する画像が 2 枚未満です" />
      </PageColumn>
    );
  }

  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">好み（pairwise）</h1>
        <p className="text-civ-muted text-sm">好きな方を 1 つ選んでください</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["left", "right"] as const).map((side) => {
            const item = pair[side];
            return (
              <Card key={side}>
                <div className="aspect-[4/3] bg-civ-section border border-civ-border rounded-card mb-3" />
                <CardTitle className="text-base">{item.label}</CardTitle>
                <p className="text-xs text-civ-muted">{item.capture_id}</p>
                <Button variant="primary" className="mt-4 w-full" onClick={() => void vote(side)}>
                  こちら
                </Button>
              </Card>
            );
          })}
        </div>
        {status === "recorded" ? (
          <p className="text-sm text-civ-success">選択を記録しました</p>
        ) : null}
      </Stack>
    </PageColumn>
  );
}
