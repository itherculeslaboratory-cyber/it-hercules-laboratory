"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api } from "@/lib/api";
import { DEFAULT_OBSERVATION_DRAFT, writeDraft } from "@/lib/observation-draft";

const DOMAIN_OPTIONS = [
  { id: "biological", label: "生物（biological）" },
  { id: "artifact", label: "モノ（artifact）" },
  { id: "digital", label: "デジタル（digital）" },
  { id: "environment", label: "環境（environment）" },
  { id: "custom", label: "ユーザー定義（custom）" },
];

const DEFAULT_TARGETS: Record<string, string[]> = {
  biological: ["Dynastes hercules hercules", "Dynastes hercules lichyi", "Dynastes tityus", "Megasoma mars"],
  artifact: ["飼育ケース", "飼育マット", "ゼリーカップ"],
  digital: ["環境ログCSV", "観測ノート", "採卵記録"],
  environment: ["飼育棚A", "飼育棚B", "温室エリア"],
  custom: ["ユーザー定義対象"],
};

export default function ObservationContextPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("biological");
  const [searchText, setSearchText] = useState("");
  const [catalog, setCatalog] = useState<Record<string, string[]>>(DEFAULT_TARGETS);
  const [selectedTarget, setSelectedTarget] = useState("Dynastes hercules hercules");

  useEffect(() => {
    api
      .get<{ status: string; domains: Record<string, string[]> }>("/api/v1/observation/targets/catalog")
      .then((res) => setCatalog(res.domains))
      .catch(() => setCatalog(DEFAULT_TARGETS));
  }, []);

  const candidates = useMemo(() => {
    const pool = catalog[domain] ?? [];
    const key = searchText.trim().toLowerCase();
    if (!key) {
      return pool;
    }
    return pool.filter((item) => item.toLowerCase().includes(key));
  }, [catalog, domain, searchText]);

  useEffect(() => {
    const first = (catalog[domain] ?? [])[0] ?? "";
    setSelectedTarget(first);
  }, [catalog, domain]);

  const applyContext = () => {
    const nextDraft = {
      ...DEFAULT_OBSERVATION_DRAFT,
      domain,
      scopeRoute: domain,
      species: selectedTarget,
      targetId: `ot_${domain}_${selectedTarget.replaceAll(" ", "_").toLowerCase()}`,
      statusStrip: "文脈を設定しました",
    };
    writeDraft(nextDraft);
    const query = new URLSearchParams({
      species: selectedTarget,
      stage: "",
      scope_route: domain,
      target_id: nextDraft.targetId,
    });
    router.push(`/observation/input?${query.toString()}`);
  };

  return (
    <PageColumn data-testid="obs-context-page">
      <Stack>
        <header>
          <h1 className="text-2xl font-normal">観測コンテキスト</h1>
          <p className="mt-2 text-sm text-civ-muted">対象を先に固定してから入力を開始します</p>
        </header>

        <Card>
          <CardTitle>ドメイン</CardTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map((option) => (
              <Button
                key={option.id}
                variant={domain === option.id ? "primary" : "secondary"}
                onClick={() => setDomain(option.id)}
                data-testid={option.id === "biological" ? "obs-tgt-domain-biological" : undefined}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>対象カタログを選択</CardTitle>
          <CardDescription>ver1 は検索+一覧選択。質問で絞る導線は ver2 で扱います。</CardDescription>
          <Input
            className="mt-4"
            placeholder="対象名で検索"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            data-testid="obs-tgt-search-input"
          />
          <div className="mt-3 space-y-2">
            {candidates.map((species) => (
              <button
                key={species}
                type="button"
                onClick={() => setSelectedTarget(species)}
                className={`w-full rounded-button border px-3 py-2 text-left ${
                  selectedTarget === species
                    ? "border-civ-info bg-civ-card text-civ-fg"
                    : "border-civ-border bg-civ-section text-civ-muted"
                }`}
                data-testid="obs-tgt-tree-node"
              >
                {species}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>現在の選択</CardTitle>
          <p className="mt-2 text-sm text-civ-muted" data-testid="obs-ctx-chip">
            {selectedTarget} ({domain})
          </p>
          <Button className="mt-4 w-full" onClick={applyContext} data-testid="obs-ctx-confirm">
            この種で観測する
          </Button>
        </Card>
      </Stack>
    </PageColumn>
  );
}
