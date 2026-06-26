"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

interface TermsSection {
  id: string;
  title: string;
  body: string;
}

interface TermsResponse {
  version: string;
  is_draft: boolean;
  sections: TermsSection[];
}

const LOCAL_TERMS: TermsResponse = {
  version: "v1-local",
  is_draft: false,
  sections: [
    {
      id: "purpose",
      title: "利用目的",
      body: "研究観測データの登録・閲覧・検証に利用します。",
    },
    {
      id: "photo",
      title: "観測写真の扱い",
      body: "色補正を行わず、撮影条件とあわせて保存・参照します。",
    },
    {
      id: "privacy",
      title: "個人情報",
      body: "識別子は必要最小限で扱い、公開範囲は機能ごとに制御します。",
    },
  ],
};

export default function TermsPage() {
  const router = useRouter();
  const [data, setData] = useState<TermsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    api
      .get<TermsResponse>("/api/v1/terms")
      .then(setData)
      .catch((e) => {
        setData(LOCAL_TERMS);
        setError(e instanceof ApiError ? e.message : "利用規約 API が未接続のためローカル文面を表示");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageColumn>
        <StatePanel kind="loading" title="利用規約を読み込み中" />
      </PageColumn>
    );
  }

  if (!data) {
    return (
      <PageColumn>
        <StatePanel kind="error" title="利用規約を表示できません" description={error ?? undefined} />
      </PageColumn>
    );
  }

  return (
    <PageColumn data-testid="auth-terms-page">
      <Stack>
        <header className="flex items-center gap-3">
          <h1 className="text-2xl font-normal">利用規約・プライバシー</h1>
          {data.is_draft ? <Badge tone="warning">草案</Badge> : null}
        </header>
        <p className="text-sm text-civ-muted">版: {data.version}</p>
        {error ? <p className="text-xs text-civ-muted">補足: {error}</p> : null}
        {data.sections.map((section) => (
          <Card key={section.id} data-testid="terms-section">
            <CardTitle>{section.title}</CardTitle>
            <p className="text-sm text-civ-muted mt-2">{section.body}</p>
          </Card>
        ))}
        <Card>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
              data-testid="terms-agree-check"
            />
            <span>内容に同意して次へ進みます</span>
          </label>
          <Button
            className="mt-4 w-full"
            disabled={!agreed}
            data-testid="terms-agree-btn"
            onClick={() => router.push("/language")}
          >
            言語選択へ進む
          </Button>
        </Card>
      </Stack>
    </PageColumn>
  );
}
