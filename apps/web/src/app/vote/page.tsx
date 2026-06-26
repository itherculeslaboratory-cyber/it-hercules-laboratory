"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

interface Vote {
  vote_id: string;
  title: string;
  status: string;
  options: { option_id: string; label: string; votes: number }[];
}

export default function VotePage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [voted, setVoted] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ items: Vote[] }>("/api/v1/votes")
      .then((r) => setVotes(r.items))
      .catch((e) => setError(e instanceof ApiError ? e.message : "読み込み失敗"))
      .finally(() => setLoading(false));
  }, []);

  async function cast(voteId: string, optionId: string) {
    await api.post(`/api/v1/votes/${voteId}/ballot?option_id=${optionId}`, {});
    setVoted(optionId);
  }

  return (
    <PageColumn>
      <Stack>
        <h1 className="text-2xl font-normal">一般投票</h1>
        {loading ? <StatePanel kind="loading" title="読み込み中" /> : null}
        {error ? <StatePanel kind="error" title="エラー" description={error} /> : null}
        {!loading && votes.length === 0 ? <StatePanel kind="empty" title="公開投票がありません" /> : null}
        {votes.map((vote) => (
          <Card key={vote.vote_id}>
            <CardTitle>{vote.title}</CardTitle>
            <p className="text-sm text-civ-muted mt-1">状態: {vote.status}</p>
            <div className="mt-4 space-y-2">
              {vote.options.map((opt) => (
                <div key={opt.option_id} className="flex items-center justify-between gap-2">
                  <span>{opt.label} ({opt.votes})</span>
                  <Button
                    variant="secondary"
                    disabled={vote.status !== "open" || voted === opt.option_id}
                    onClick={() => void cast(vote.vote_id, opt.option_id)}
                  >
                    投票
                  </Button>
                </div>
              ))}
            </div>
            {voted ? <p className="text-sm text-civ-success mt-2">投票済み</p> : null}
          </Card>
        ))}
      </Stack>
    </PageColumn>
  );
}
