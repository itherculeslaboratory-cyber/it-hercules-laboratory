"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

interface Category {
  id: string;
  label: string;
  description: string;
}

export default function BoardHubPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ categories: Category[] }>("/api/v1/board/categories")
      .then((r) => setCategories(r.categories))
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">掲示板ハブ</h1>
        <p className="text-civ-muted text-sm">目的に合う板を選んでください</p>
        {loading ? <StatePanel kind="loading" title="読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/board/${cat.id}`} className="no-underline">
              <Card className="hover:border-civ-info">
                <CardTitle>{cat.label}</CardTitle>
                <CardDescription>{cat.description}</CardDescription>
              </Card>
            </Link>
          ))}
          <Link href="/board/paper" className="no-underline">
            <Card className="hover:border-civ-info">
              <CardTitle>論文（研究）</CardTitle>
              <CardDescription>進行中 · テンプレ駆動</CardDescription>
            </Card>
          </Link>
          <Link href="/board/component" className="no-underline">
            <Card className="hover:border-civ-info">
              <CardTitle>コンポーネント掲示板</CardTitle>
              <CardDescription>issue / PR</CardDescription>
            </Card>
          </Link>
        </div>
      </Stack>
    </PageColumn>
  );
}
