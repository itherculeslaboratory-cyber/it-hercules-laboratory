"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageColumn, Stack } from "@/components/layout/page-column";

const FIELDS = ["仮説", "方法", "結果", "考察"];

export default function PaperTemplatePage() {
  return (
    <PageColumn>
      <Stack>
        <Link href="/board/paper" className="text-sm text-civ-muted">← 論文板</Link>
        <h1 className="text-2xl font-normal">論文テンプレート</h1>
        <Card>
          {FIELDS.map((field) => (
            <label key={field} className="block mb-4 text-sm text-civ-muted">
              {field}
              <Input className="mt-1" placeholder={`${field}を入力`} />
            </label>
          ))}
          <Button variant="primary">下書きを保存</Button>
        </Card>
      </Stack>
    </PageColumn>
  );
}
