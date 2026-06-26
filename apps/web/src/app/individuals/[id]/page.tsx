"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageColumn, Stack } from "@/components/layout/page-column";
import { api, ApiError } from "@/lib/api";

interface IndividualOption {
  individual_id: string;
  display_name: string;
  species?: string;
}

interface ParentResponse {
  status: string;
  individual_id: string;
  sire_id?: string | null;
  dam_id?: string | null;
}

export default function IndividualDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [options, setOptions] = useState<IndividualOption[]>([]);
  const [sireId, setSireId] = useState("");
  const [damId, setDamId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get<{ status: string; items: IndividualOption[] }>("/api/v1/individuals/search?owner_user_id=u_demo")
      .then((res) => setOptions(res.items))
      .catch(() => setOptions([]));
    api
      .get<ParentResponse>(`/api/v1/individuals/${id}/parents`)
      .then((res) => {
        setSireId(res.sire_id ?? "");
        setDamId(res.dam_id ?? "");
      })
      .catch(() => {
        setSireId("");
        setDamId("");
      });
  }, [id]);

  const saveParents = async () => {
    setMessage("");
    setSaving(true);
    try {
      await api.put(`/api/v1/individuals/${id}/parents`, {
        owner_user_id: "u_demo",
        sire_id: sireId || undefined,
        dam_id: damId || undefined,
      });
      setMessage("親個体を保存しました。");
    } catch (e) {
      setMessage(e instanceof ApiError ? e.message : "親個体の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageColumn data-testid="individual-detail-page">
      <Stack>
        <Link href="/observation" className="text-sm text-civ-muted">
          ← 観測一覧に戻る
        </Link>
        <Card>
          <CardTitle>個体プロフィール</CardTitle>
          <CardDescription>ID: {id}</CardDescription>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-civ-muted">種</dt>
              <dd>Dynastes hercules hercules</dd>
            </div>
            <div>
              <dt className="text-civ-muted">ステージ</dt>
              <dd>adult</dd>
            </div>
            <div>
              <dt className="text-civ-muted">父系</dt>
              <dd>IND-FATHER-001</dd>
            </div>
            <div>
              <dt className="text-civ-muted">母系</dt>
              <dd>IND-MOTHER-004</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-card border border-civ-border p-3" data-testid="individual-parent-picker">
            <CardDescription>親個体（ver1: 父/母）</CardDescription>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="text-sm text-civ-muted">
                ♂ 父
                <select
                  value={sireId}
                  onChange={(e) => setSireId(e.target.value)}
                  className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                >
                  <option value="">未設定</option>
                  {options
                    .filter((row) => row.individual_id !== id)
                    .map((row) => (
                      <option key={row.individual_id} value={row.individual_id}>
                        {row.display_name || row.individual_id}
                      </option>
                    ))}
                </select>
              </label>
              <label className="text-sm text-civ-muted">
                ♀ 母
                <select
                  value={damId}
                  onChange={(e) => setDamId(e.target.value)}
                  className="mt-1 w-full rounded-button border border-civ-border bg-civ-section px-3 min-h-[44px]"
                >
                  <option value="">未設定</option>
                  {options
                    .filter((row) => row.individual_id !== id)
                    .map((row) => (
                      <option key={row.individual_id} value={row.individual_id}>
                        {row.display_name || row.individual_id}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={saveParents} disabled={saving} data-testid="individual-parent-save">
                {saving ? "保存中..." : "親を保存"}
              </Button>
              {message ? <p className="text-xs text-civ-muted">{message}</p> : null}
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={`/individuals/${id}/qr`}
              className="inline-flex min-h-[44px] items-center rounded-button bg-civ-info px-4 py-2 text-sm text-civ-deep no-underline"
              data-testid="ind-open-qr"
            >
              QR を開く
            </Link>
          </div>
        </Card>
      </Stack>
    </PageColumn>
  );
}
