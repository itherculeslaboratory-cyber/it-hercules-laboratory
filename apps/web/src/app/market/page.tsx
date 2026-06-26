"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

interface Listing {
  listing_id: string;
  title: string;
  price_pt: number;
  channel: string;
  seller_handle: string;
  condition: string;
}

export default function MarketPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [channel, setChannel] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = channel ? `?channel=${channel}` : "";
    api
      .get<{ items: Listing[] }>(`/api/v1/market/listings${q}`)
      .then((r) => setItems(r.items))
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, [channel]);

  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">マーケット</h1>
        <div className="flex gap-2" role="tablist">
          {[
            { id: "", label: "すべて" },
            { id: "listing", label: "出品" },
            { id: "auction", label: "オークション" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={channel === tab.id}
              onClick={() => setChannel(tab.id)}
              className={`rounded-button border px-3 py-2 text-sm min-h-[44px] ${
                channel === tab.id ? "border-civ-info text-civ-info" : "border-civ-border text-civ-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {loading ? <StatePanel kind="loading" title="出品を読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {!loading && !error && items.length === 0 ? (
          <StatePanel kind="empty" title="出品がありません" />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <Link key={item.listing_id} href={`/market/${item.listing_id}`} className="no-underline">
              <Card className="hover:border-civ-info">
                <div className="aspect-[4/3] bg-civ-section border border-civ-border rounded-card mb-3" />
                <CardTitle className="text-base">{item.title}</CardTitle>
                <CardDescription>
                  {item.price_pt} PT · @{item.seller_handle}
                </CardDescription>
                <Badge tone="muted" className="mt-2">{item.condition}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      </Stack>
    </PageColumn>
  );
}
