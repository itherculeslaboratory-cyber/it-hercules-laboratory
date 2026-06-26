"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageColumn, Stack } from "@/components/layout/page-column";

export default function LanguagePage() {
  const router = useRouter();
  const [language, setLanguage] = useState("ja");

  return (
    <PageColumn className="max-w-md" data-testid="auth-language-page">
      <Stack>
        <h1 className="text-2xl font-normal">表示言語</h1>
        <Card>
          <CardTitle>言語を選択</CardTitle>
          <CardDescription>後から設定画面でも変更できます</CardDescription>
          <div className="mt-4 space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="lang"
                value="ja"
                checked={language === "ja"}
                onChange={(e) => setLanguage(e.target.value)}
              />
              日本語
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="lang"
                value="en"
                checked={language === "en"}
                onChange={(e) => setLanguage(e.target.value)}
              />
              English
            </label>
          </div>
          <Button
            className="mt-4 w-full"
            data-testid="lang-continue-btn"
            onClick={() => router.push("/")}
          >
            この設定で続行
          </Button>
        </Card>
      </Stack>
    </PageColumn>
  );
}
