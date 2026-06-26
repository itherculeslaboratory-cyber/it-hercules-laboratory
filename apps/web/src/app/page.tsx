"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { useHomeSummary } from "@/hooks/useHomeSummary";

export default function HomePage() {
  const { data, loading, error, reload } = useHomeSummary();

  if (loading) {
    return (
      <PageColumn>
        <StatePanel kind="loading" title="ホームを読み込み中" />
      </PageColumn>
    );
  }

  if (!data) {
    return (
      <PageColumn>
        <StatePanel
          kind="error"
          title="ホームを表示できません"
          description={error ?? undefined}
          onRetry={reload}
        />
      </PageColumn>
    );
  }

  return (
    <PageColumn data-testid="home-main-page">
      <Stack>
        <header data-testid="home-welcome-msg" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-normal">司令塔</h1>
            <p className="text-civ-muted mt-2">観測フローを 3 クリック以内で再開できます</p>
          </div>
          <BrandLogo variant="mark" linked={false} className="opacity-90" />
        </header>

        <Card data-testid={data.source === "api" ? "home-minimap-metrics" : "home-minimap-error"}>
          <CardTitle>今日の要約</CardTitle>
          {error ? <p className="mt-1 text-xs text-civ-muted">補足: {error}</p> : null}
          <ul className="mt-2 space-y-1 text-sm text-civ-muted list-disc pl-5">
            {data.today_lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2" data-testid="home-action-cards">
          {data.cards.map((card) => (
            <Link key={card.id} href={card.href} className="no-underline">
              <Card className="hover:border-civ-info transition-colors">
                <CardDescription>{card.label}</CardDescription>
                <p className="text-2xl text-civ-fg mt-1">{card.value}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/observation" className="no-underline" data-testid="home-obs-card">
            <Card className="h-full hover:border-civ-info">観測検索</Card>
          </Link>
          <Link href="/market" className="no-underline" data-testid="home-market-cta">
            <Card className="h-full hover:border-civ-info">マーケット</Card>
          </Link>
          <Link href="/board" className="no-underline" data-testid="home-bbs-cta">
            <Card className="h-full hover:border-civ-info">知の広場</Card>
          </Link>
          <Link href="/scan" className="no-underline" data-testid="home-scan-cta">
            <Card className="h-full hover:border-civ-info">QRで再開</Card>
          </Link>
          <Link href="/match" className="no-underline">
            <Card className="h-full hover:border-civ-info">好み</Card>
          </Link>
          <Link href="/contribution" className="no-underline">
            <Card className="h-full hover:border-civ-info">貢献度</Card>
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/observation/context"
            className="inline-flex items-center justify-center rounded-button px-4 py-2 text-sm font-normal min-h-[44px] bg-civ-info text-civ-deep no-underline hover:opacity-90"
            data-testid="home-obs-cta"
          >
            観測登録開始
          </Link>
          <Link
            href="/observation"
            className="inline-flex items-center justify-center rounded-button border border-civ-border px-4 py-2 text-sm font-normal min-h-[44px] text-civ-fg no-underline hover:bg-civ-card"
            data-testid="home-obs-search-cta"
          >
            観測検索
          </Link>
        </div>
      </Stack>
    </PageColumn>
  );
}
