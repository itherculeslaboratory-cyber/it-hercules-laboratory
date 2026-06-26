"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageColumn, Stack } from "@/components/layout/page-column";

export default function KarmaAdminPage() {
  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">カルマ管理（L4）</h1>
        <Card>
          <CardTitle>監査サマリー</CardTitle>
          <CardDescription>管理者向け · カルマ調整イベントは append-only</CardDescription>
          <p className="text-sm text-civ-muted mt-4">直近の調整: 0 件</p>
        </Card>
      </Stack>
    </PageColumn>
  );
}
