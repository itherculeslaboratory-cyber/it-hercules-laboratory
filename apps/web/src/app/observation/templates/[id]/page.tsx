"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function TemplateDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Record<string, unknown>>(`/api/v1/observation/templates/${id}`)
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageColumn><StatePanel kind="loading" title="読み込み中" /></PageColumn>;
  if (error || !data) return <PageColumn><StatePanel kind="error" title="テンプレなし" description={error ?? undefined} /></PageColumn>;

  const items = (data.items as { item: string; unit: string }[]) ?? [];

  return (
    <PageColumn>
      <Stack>
        <Link href="/observation/templates" className="text-sm text-civ-muted">← 一覧</Link>
        <Card>
          <CardTitle>{String(data.title)}</CardTitle>
          <ul className="mt-4 space-y-1 text-sm">
            {items.map((row) => (
              <li key={row.item}>{row.item} ({row.unit})</li>
            ))}
          </ul>
          <div className="mt-6 flex gap-2">
            <Link href="/observation/input" className="no-underline">
              <Button variant="primary" data-testid="obs-tpl-use-btn">
                このテンプレで記録
              </Button>
            </Link>
            <Link href={`/observation/templates/${id}/fork`} className="no-underline">
              <Button variant="secondary" data-testid="obs-tpl-fork-btn">
                複製して編集
              </Button>
            </Link>
          </div>
        </Card>
      </Stack>
    </PageColumn>
  );
}
