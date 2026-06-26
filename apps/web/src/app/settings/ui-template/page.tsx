"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

interface ThemePack {
  theme_pack_id: string;
  title: string;
  status: string;
}

export default function UiTemplatePage() {
  const [items, setItems] = useState<ThemePack[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: ThemePack[] }>("/api/v1/theme-packs")
      .then((r) => {
        setItems(r.items);
        const active = r.items.find((p) => p.status === "active");
        setSelected(active?.theme_pack_id ?? null);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageColumn>
      <Stack>
        <Link href="/settings" className="text-sm text-civ-muted">← 設定</Link>
        <h1 className="text-2xl font-normal">UI テンプレ選択</h1>
        {loading ? <StatePanel kind="loading" title="読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {items.map((pack) => (
          <Card key={pack.theme_pack_id} className={selected === pack.theme_pack_id ? "border-civ-info" : ""}>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base mb-0">{pack.title}</CardTitle>
              {pack.status === "active" ? <Badge tone="success">適用中</Badge> : null}
            </div>
            <Button variant="secondary" className="mt-3" onClick={() => setSelected(pack.theme_pack_id)}>
              適用
            </Button>
          </Card>
        ))}
      </Stack>
    </PageColumn>
  );
}
