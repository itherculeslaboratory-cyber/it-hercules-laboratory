"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

const DOMAINS = [
  { id: "bio", label: "生物" },
  { id: "artifact", label: "器物" },
  { id: "digital", label: "デジタル" },
  { id: "env", label: "環境" },
  { id: "custom", label: "カスタム" },
];

interface ContextPickerProps {
  onApply: (query: string) => void;
}

export function ContextPicker({ onApply }: ContextPickerProps) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("bio");
  const [stage, setStage] = useState("adult");

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} aria-expanded={open}>
        対象を選ぶ
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4"
          role="dialog"
          aria-label="観測コンテキスト"
        >
          <Card className="w-full max-w-lg">
            <CardTitle>対象ナビゲータ</CardTitle>
            <p className="text-sm text-civ-muted mt-2">ドメイン → ステージ → 適用（文字のみ）</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <Button
                  key={d.id}
                  variant={domain === d.id ? "primary" : "secondary"}
                  onClick={() => setDomain(d.id)}
                >
                  {d.label}
                </Button>
              ))}
            </div>
            <label className="block mt-4 text-sm text-civ-muted">
              ステージ
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 py-2 min-h-[44px]"
              >
                <option value="larva">幼虫</option>
                <option value="pupa">蛹</option>
                <option value="adult">成虫</option>
              </select>
            </label>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" onClick={() => { onApply(`?domain=${domain}&stage=${stage}`); setOpen(false); }}>
                適用
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>閉じる</Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
