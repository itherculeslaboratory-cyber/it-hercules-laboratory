"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function ComponentBoardPage() {
  const [threads, setThreads] = useState<{ thread_id: string; title: string; kind: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ threads: typeof threads }>("/api/v1/board/component/threads")
      .then((r) => setThreads(r.threads))
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageColumn>
      <Stack>
        <Link href="/board" className="text-sm text-civ-muted">← 掲示板</Link>
        <h1 className="text-2xl font-normal">コンポーネント掲示板</h1>
        {loading ? <StatePanel kind="loading" title="読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {!loading && threads.length === 0 ? <StatePanel kind="empty" title="issue / PR がありません" /> : null}
        {threads.map((thr) => (
          <Card key={thr.thread_id}>
            <div className="flex items-center gap-2">
              <Badge tone="muted">{thr.kind}</Badge>
              <CardTitle className="text-base mb-0">{thr.title}</CardTitle>
            </div>
          </Card>
        ))}
      </Stack>
    </PageColumn>
  );
}
