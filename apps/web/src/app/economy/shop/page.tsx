"use client";

// DEFER: IHL-BRAND-SHOP-UI — PT shop / brand PNG polish deferred (2026-06-26). See docs/implementation-deferrals.md

import { useEffect, useState } from "react";
import { EconIcon, isIndulgenceSku } from "@/components/brand/econ-icon";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

export default function PtShopPage() {
  const [data, setData] = useState<{
    balance: number;
    items: { sku: string; label: string; price_pt: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<typeof data>("/api/v1/economy/shop")
      .then(setData)
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageColumn><StatePanel kind="loading" title="ショップ読み込み中" /></PageColumn>;
  if (error || !data) return <PageColumn><StatePanel kind="error" title="表示できません" description={error ?? undefined} /></PageColumn>;

  return (
    <PageColumn>
      <Stack>
        <header className="civ-shopHero" data-testid="shop-hero">
          <div className="civ-shopHero__titleRow">
            <EconIcon kind="pt-coin" size="md" />
            <h1 className="text-2xl font-normal m-0">プラチナコインショップ</h1>
          </div>
          <p className="civ-shopHero__balance" data-testid="shop-balance">
            <EconIcon kind="pt-coin" size="sm" />
            <span>残高: {data.balance} PT</span>
          </p>
        </header>

        {data.items.map((item) => {
          const indulgence = isIndulgenceSku(item.sku);
          return (
            <Card key={item.sku} className="civ-shopCard p-4" data-testid={`shop-item-${item.sku}`}>
              <div className="civ-shopCard__row">
                <div className="civ-shopCard__icon">
                  <EconIcon kind={indulgence ? "indulgence" : "pt-coin"} size="lg" />
                </div>
                <div className="civ-shopCard__body">
                  <CardTitle className="text-base mb-1">{item.label}</CardTitle>
                  <p className="civ-shopCard__price">
                    <EconIcon kind="pt-coin" size="sm" />
                    <span>{item.price_pt} PT</span>
                  </p>
                  {indulgence ? (
                    <p className="text-xs text-civ-muted mt-1.5">
                      購入時にカルマカウントが 1 件解消されます
                    </p>
                  ) : null}
                </div>
                <div className="civ-shopCard__action">
                  <Button variant="primary" disabled={data.balance < item.price_pt}>
                    購入
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </Stack>
    </PageColumn>
  );
}
