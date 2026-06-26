"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function MortalityPage() {
  const params = useParams();
  const id = String(params.id);
  const [records, setRecords] = useState<{ individual_id: string; cause: string; observation_id: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ records: typeof records }>(`/api/v1/cross/${id}/mortality`)
      .then((r) => setRecords(r.records))
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <PageColumn>
      <Stack>
        <Link href={`/cross/${id}`} className="text-sm text-civ-muted">← 血統</Link>
        <h1 className="text-2xl font-normal">死亡一覧</h1>
        {loading ? <StatePanel kind="loading" title="読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {!loading && !error && records.length === 0 ? (
          <StatePanel kind="empty" title="死亡記録は 0 件" />
        ) : null}
        {records.map((rec) => (
          <Card key={rec.individual_id}>
            <CardTitle className="text-base">{rec.individual_id}</CardTitle>
            <p className="text-sm text-civ-muted">原因: {rec.cause}</p>
            {rec.observation_id ? (
              <Link href={`/observation/${rec.observation_id}`} className="text-sm">観測詳細へ</Link>
            ) : null}
          </Card>
        ))}
      </Stack>
    </PageColumn>
  );
}
