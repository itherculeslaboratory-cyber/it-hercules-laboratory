"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

interface Template {
  template_id: string;
  title: string;
  visibility: string;
  item_count: number;
}

export default function TemplatesListPage() {
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Template[] }>("/api/v1/observation/templates")
      .then((r) => setItems(r.items))
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageColumn>
      <Stack>
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-normal">計測テンプレ一覧</h1>
          <Button variant="primary">新規テンプレを作成</Button>
        </header>
        {loading ? <StatePanel kind="loading" title="読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {!loading && !error && items.length === 0 ? (
          <div data-testid="obs-tpl-empty-state">
            <StatePanel kind="empty" title="テンプレがありません" />
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((tpl) => (
            <Link key={tpl.template_id} href={`/observation/templates/${tpl.template_id}`} className="no-underline">
              <Card className="hover:border-civ-info" data-testid="obs-tpl-card">
                <CardTitle>{tpl.title}</CardTitle>
                <CardDescription>
                  {tpl.visibility} · {tpl.item_count} 項目
                </CardDescription>
              </Card>
            </Link>
          ))}
        </div>
      </Stack>
    </PageColumn>
  );
}
