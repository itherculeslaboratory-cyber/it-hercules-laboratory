"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function EnvShelfPage() {
  const [items, setItems] = useState<{ device_id: string; name: string; kind: string; status: string; last_reading: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: typeof items }>("/api/v1/devices")
      .then((r) => setItems(r.items))
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageColumn>
      <Stack>
        <Link href="/settings" className="text-sm text-civ-muted">← 設定</Link>
        <h1 className="text-2xl font-normal">データ取得元（機器）</h1>
        {loading ? <StatePanel kind="loading" title="機器一覧を読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {!loading && items.length === 0 ? <StatePanel kind="empty" title="登録機器がありません" /> : null}
        {items.map((dev) => (
          <Card key={dev.device_id}>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base mb-0">{dev.name}</CardTitle>
              <Badge tone={dev.status === "connected" ? "success" : "muted"}>{dev.status}</Badge>
            </div>
            <p className="text-sm text-civ-muted mt-1">{dev.kind} · 最終: {dev.last_reading}</p>
          </Card>
        ))}
      </Stack>
    </PageColumn>
  );
}
