"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageColumn, Stack } from "@/components/layout/page-column";

export default function BuilderPage() {
  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">UI ビルダー</h1>
        <Card>
          <CardTitle>キャンバス</CardTitle>
          <CardDescription>部品を配置・デザイン・保存（ThemePack · ScreenDef）</CardDescription>
          <div className="mt-6 min-h-[320px] border border-dashed border-civ-border rounded-card flex items-center justify-center text-civ-muted">
            部品 0 件 — 左パレットからドラッグ（プレビュー）
          </div>
        </Card>
        <Card>
          <CardTitle>Lint</CardTitle>
          <p className="text-sm text-civ-success mt-2">配置ルール: 問題なし</p>
        </Card>
      </Stack>
    </PageColumn>
  );
}
