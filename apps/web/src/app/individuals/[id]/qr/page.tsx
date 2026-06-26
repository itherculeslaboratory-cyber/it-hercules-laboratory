"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageColumn, Stack } from "@/components/layout/page-column";

export default function IndividualQrPage() {
  const params = useParams();
  const id = String(params.id);
  const qrValue = `ihl://individual/${id}`;

  return (
    <PageColumn data-testid="individual-qr-page">
      <Stack>
        <Link href={`/individuals/${id}`} className="text-sm text-civ-muted">
          ← 個体詳細へ戻る
        </Link>
        <Card>
          <CardTitle>個体 QR</CardTitle>
          <CardDescription>観測入力を再開するための QR です</CardDescription>
          <div className="mt-4 rounded-card border border-civ-border p-6 text-center text-sm">
            {qrValue}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button data-testid="ind-qr-download">QR を保存</Button>
            <Link href="/scan" className="no-underline">
              <Button variant="secondary">スキャン画面へ</Button>
            </Link>
          </div>
        </Card>
      </Stack>
    </PageColumn>
  );
}
