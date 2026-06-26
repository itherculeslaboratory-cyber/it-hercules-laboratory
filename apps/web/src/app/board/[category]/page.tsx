"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

interface Thread {
  thread_id: string;
  title: string;
  post_count: number;
  case_chip?: string;
}

export default function BoardCategoryPage() {
  const params = useParams();
  const category = String(params.category);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ threads: Thread[] }>(`/api/v1/board/${category}/threads`)
      .then((r) => setThreads(r.threads))
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <PageColumn>
      <Stack>
        <Link href="/board" className="text-sm text-civ-muted">← ハブ</Link>
        <h1 className="text-2xl font-normal">掲示板: {category}</h1>
        <Button variant="primary" className="self-start">投稿する</Button>
        {loading ? <StatePanel kind="loading" title="スレッド読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {!loading && !error && threads.length === 0 ? (
          <StatePanel kind="empty" title="スレッドがありません" />
        ) : null}
        <div className="space-y-3">
          {threads.map((thr) => (
            <Card key={thr.thread_id}>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base mb-0">{thr.title}</CardTitle>
                {thr.case_chip ? <Badge tone="info">{thr.case_chip}</Badge> : null}
              </div>
              <p className="text-sm text-civ-muted mt-1">{thr.post_count} 投稿</p>
              <Link href={`/board/${category}/dispute?thread=${thr.thread_id}`} className="text-sm mt-2 inline-block">
                争い部屋（公開観覧）
              </Link>
            </Card>
          ))}
        </div>
      </Stack>
    </PageColumn>
  );
}
