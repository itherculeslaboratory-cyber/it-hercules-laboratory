"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageColumn, Stack } from "@/components/layout/page-column";

export default function TemplateForkPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = String(params.id);
  const [title, setTitle] = useState(`${templateId}-fork`);

  return (
    <PageColumn data-testid="obs-template-fork-page">
      <Stack>
        <Link href={`/observation/templates/${templateId}`} className="text-sm text-civ-muted">
          ← テンプレ詳細へ戻る
        </Link>
        <Card>
          <CardTitle>テンプレ Fork</CardTitle>
          <CardDescription>ver1 はローカル下書きとして保存し、入力画面に引き継ぎます</CardDescription>
          <label className="mt-4 block text-sm text-civ-muted">
            新しいテンプレ名
            <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                router.push(`/observation/input?template=${encodeURIComponent(templateId)}&fork=${encodeURIComponent(title)}`)
              }
              data-testid="obs-tpl-fork-btn"
            >
              Fork を保存して入力へ
            </Button>
            <Button variant="secondary" onClick={() => router.push(`/observation/templates/${templateId}`)}>
              キャンセル
            </Button>
          </div>
        </Card>
      </Stack>
    </PageColumn>
  );
}
