"use client";

import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { readCommitRecord } from "@/lib/observation-draft";

export default function ObservationDonePage() {
  const record = readCommitRecord();

  return (
    <PageColumn data-testid="obs-done-page">
      <Stack>
        <Card>
          <CardTitle data-testid="obs-success-msg">観測を登録しました</CardTitle>
          <CardDescription className="mt-2">
            sessionId: {record?.sessionId ?? "sess_demo"} / r2Key: {record?.r2Key ?? "r2://observation/demo"}
          </CardDescription>
          <p className="mt-3 text-sm text-civ-muted">対象: {record?.species ?? "未記録"}</p>
          {record?.displayName ? (
            <p className="mt-1 text-sm text-civ-muted">
              表示名: {record.displayName} / name_event: {record.nameEventId ?? "記録済み"}
            </p>
          ) : null}
        </Card>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/observation"
            className="inline-flex min-h-[44px] items-center rounded-button bg-civ-info px-4 py-2 text-sm text-civ-deep no-underline"
            data-testid="obs-goto-grid-btn"
          >
            観測グリッドへ
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center rounded-button border border-civ-border px-4 py-2 text-sm no-underline"
            data-testid="obs-goto-home-btn"
          >
            ホームへ戻る
          </Link>
        </div>
      </Stack>
    </PageColumn>
  );
}
