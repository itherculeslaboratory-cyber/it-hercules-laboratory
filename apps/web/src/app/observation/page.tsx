"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { ContextPicker } from "@/components/observation/context-picker";
import { useObservationSearch } from "@/hooks/useObservationSearch";
import { AuthenticatedImage } from "@/components/observation/AuthenticatedImage";
import { photoAbsentMessage } from "@/lib/observation-photo";

function formatObservedAt(value?: string) {
  if (!value) return "日時未記録";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ja-JP", { hour12: false });
}

export default function ObservationSearchPage() {
  const { items, total, loading, error, emptyMessage, search } = useObservationSearch();
  const [species, setSpecies] = useState("");
  const [sex, setSex] = useState("");

  useEffect(() => {
    void search({});
  }, [search]);

  return (
    <PageColumn data-testid="obs-grid-page">
      <Stack>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-normal">観測 検索</h1>
            <p className="text-civ-muted text-sm mt-1">色補正なし · 撮影条件を併記</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <ContextPicker onApply={() => void search({ stage_name: "adult" })} />
            <Link href="/observation/context" className="no-underline">
              <Button variant="secondary" data-testid="obs-open-context">
                文脈設定
              </Button>
            </Link>
            <Link href="/observation/input" className="no-underline">
              <Button variant="secondary">計測入力</Button>
            </Link>
            <Link href="/observation/templates" className="no-underline">
              <Button variant="ghost">テンプレ</Button>
            </Link>
          </div>
        </header>

        <Card>
          <CardTitle>フィルタ</CardTitle>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Input
              placeholder="種 (species)"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              aria-label="種"
            />
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="rounded-button border border-civ-border bg-civ-section px-3 py-2 min-h-[44px]"
              aria-label="性別"
            >
              <option value="">性別（すべて）</option>
              <option value="male">雄</option>
              <option value="female">雌</option>
              <option value="unknown">不明</option>
            </select>
            <Button
              variant="primary"
              onClick={() => void search({ species: species || undefined, sex: sex || undefined })}
            >
              絞り込む
            </Button>
          </div>
        </Card>

        {loading ? <StatePanel kind="loading" title="検索中" /> : null}
        {error ? (
          <StatePanel kind="error" title="検索エラー" description={error} onRetry={() => void search({})} />
        ) : null}
        {!loading && !error && emptyMessage ? (
          <StatePanel kind="empty" title="該当なし" description={emptyMessage} />
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <>
            <p className="text-sm text-civ-muted">{total} 件</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.capture_id} className="hover:border-civ-info">
                  <div
                    className="aspect-[4/3] bg-civ-section border border-civ-border rounded-card mb-3 flex items-center justify-center text-civ-muted text-xs overflow-hidden px-3 text-center"
                    data-testid={item.image_url ? "obs-grid-thumbnail-wrap" : "obs-grid-no-photo"}
                  >
                    {item.image_url ? (
                      <AuthenticatedImage
                        src={item.image_url}
                        alt=""
                        className="h-full w-full object-contain"
                        data-testid="obs-grid-thumbnail"
                      />
                    ) : (
                      <span>{photoAbsentMessage(item.photo_absent_reason)}</span>
                    )}
                  </div>
                  <CardTitle className="text-base">{item.display_name ?? item.species ?? item.capture_id}</CardTitle>
                  <CardDescription>{item.species ?? "種情報なし"}</CardDescription>
                  <p className="text-xs text-civ-muted mt-2">capture: {item.capture_id}</p>
                  <p className="text-xs text-civ-muted">観測: {formatObservedAt(item.observed_at ?? item.capture_timestamp ?? item.created_at)}</p>
                  <p className="text-xs text-civ-muted">
                    属性: {item.sex ?? "—"} · {item.phase_label ?? item.stage_name ?? "—"} · {item.view_type ?? "—"}
                  </p>
                  <p className="text-xs text-civ-muted mt-1">
                    計測: {item.key_measurements && item.key_measurements.length > 0 ? item.key_measurements.join(" / ") : "主要計測なし"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/observation/${item.capture_id}`} className="no-underline" data-testid="obs-open-detail">
                      <Button variant="secondary">詳細を見る</Button>
                    </Link>
                    {item.individual_id ? (
                      <Link
                        href={`/individuals/${item.individual_id}`}
                        className="inline-flex items-center rounded-button border border-civ-border px-3 py-2 text-xs no-underline"
                      >
                        個体へ
                      </Link>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : null}
      </Stack>
    </PageColumn>
  );
}
