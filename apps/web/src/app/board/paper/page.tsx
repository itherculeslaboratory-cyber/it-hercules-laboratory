"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageColumn, Stack } from "@/components/layout/page-column";

export default function PaperBoardPage() {
  return (
    <PageColumn>
      <Stack>
        <Link href="/board" className="text-sm text-civ-muted">← 掲示板</Link>
        <header className="flex items-center gap-2">
          <h1 className="text-2xl font-normal">論文（進行中）</h1>
          <Badge tone="info">in_progress</Badge>
        </header>
        <Card>
          <CardTitle>角長と世代の相関</CardTitle>
          <p className="text-sm text-civ-muted mt-2">case: case_alpha · 観測→仮説→試す→記録→引用</p>
          <div className="mt-4 flex gap-2">
            <Button variant="primary">条件を合わせて参加</Button>
            <Link href="/board/paper/template" className="no-underline">
              <Button variant="secondary">テンプレート</Button>
            </Link>
          </div>
        </Card>
      </Stack>
    </PageColumn>
  );
}
