"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageColumn, Stack } from "@/components/layout/page-column";

export default function QrScanPage() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState("ind_demo_001");
  const [result, setResult] = useState("");

  const startScan = () => {
    setResult(`検出: ${manualCode}`);
    const query = new URLSearchParams({
      individual_id: manualCode,
      species: "Dynastes hercules hercules",
      scope_route: "biological",
    });
    router.push(`/observation/input?${query.toString()}`);
  };

  return (
    <PageColumn data-testid="obs-qr-scan-page">
      <Stack>
        <header>
          <h1 className="text-2xl font-normal">QR で観測再開</h1>
          <p className="mt-2 text-sm text-civ-muted">カメラが使えない場合は手入力で再開できます</p>
        </header>
        <Card>
          <CardTitle>スキャン</CardTitle>
          <CardDescription>ver1 はカメラ起動の代わりに入力値を即時適用します</CardDescription>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={startScan} data-testid="qr-scan-start">
              スキャン開始
            </Button>
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              aria-label="QRコード手入力"
              className="max-w-xs"
            />
          </div>
          {result ? <p className="mt-3 text-sm text-civ-muted">{result}</p> : null}
        </Card>
      </Stack>
    </PageColumn>
  );
}
