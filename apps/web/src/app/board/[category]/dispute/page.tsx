"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function DisputeRoomPage() {
  const params = useParams();
  const search = useSearchParams();
  const category = String(params.category);
  const threadId = search.get("thread") ?? "default";
  const [data, setData] = useState<{
    status: string;
    messages: { actor: string; body: string; at: string }[];
    deadline: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<typeof data>(`/api/v1/dispute/${threadId}`)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, [threadId]);

  return (
    <PageColumn>
      <Stack>
        <Link href={`/board/${category}`} className="text-sm text-civ-muted">← 板に戻る</Link>
        <h1 className="text-2xl font-normal">争い 二人部屋（公開観覧）</h1>
        {loading ? <StatePanel kind="loading" title="読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {data ? (
          <Card>
            <CardTitle>状態: {data.status}</CardTitle>
            <p className="text-sm text-civ-muted mt-1">期限: {data.deadline}</p>
            <ul className="mt-4 space-y-3">
              {data.messages.map((msg, i) => (
                <li key={i} className="text-sm border-l-2 border-civ-border pl-3">
                  <span className="text-civ-muted">{msg.actor}</span>
                  <p>{msg.body}</p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </Stack>
    </PageColumn>
  );
}
