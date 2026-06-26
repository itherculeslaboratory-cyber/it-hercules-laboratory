"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function CrossPage() {
  const params = useParams();
  const id = String(params.id);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Record<string, unknown>>(`/api/v1/cross/${id}`)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageColumn><StatePanel kind="loading" title="血統を読み込み中" /></PageColumn>;
  if (error || !data) return <PageColumn><StatePanel kind="error" title="交配記録なし" description={error ?? undefined} /></PageColumn>;

  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">血統・交配</h1>
        <Card>
          <CardTitle>{String(data.label)}</CardTitle>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-civ-muted">世代数</dt><dd>{String(data.generation_count)}</dd></div>
            <div><dt className="text-civ-muted">生存子</dt><dd>{String(data.offspring_alive)}</dd></div>
            <div><dt className="text-civ-muted">死亡数</dt><dd>{String(data.offspring_mortality)}</dd></div>
          </dl>
          <Link href={`/cross/${id}/mortality`} className="text-sm mt-4 inline-block">
            死亡一覧へ
          </Link>
        </Card>
      </Stack>
    </PageColumn>
  );
}
