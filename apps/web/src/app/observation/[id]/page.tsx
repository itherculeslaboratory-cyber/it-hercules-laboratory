"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatePanel } from "@/components/ui/state-panel";
import { PageColumn, Stack } from "@/components/layout/page-column";
import {
  ObservationDetailSections,
  type DeviceRow,
  type EnvironmentSnapshot,
  type MeasurementRow,
  type PhotoConditionRow,
  type SimilarHitRow,
} from "@/components/observation/ObservationDetailSections";
import { api, ApiError } from "@/lib/api";

interface DetailResponse {
  capture: Record<string, unknown> & {
    display_name?: string;
    image_url?: string | null;
    photo_absent_reason?: "not_saved_at_commit" | "blob_missing" | null;
  };
  measurements: MeasurementRow[];
  photo_conditions: PhotoConditionRow[];
  devices: DeviceRow[];
  environment_snapshot: EnvironmentSnapshot | null;
  similar: SimilarHitRow[];
}

interface ErrorState {
  kind: "error" | "empty";
  title: string;
  description?: string;
}

function ObservationBreadcrumb() {
  return (
    <nav aria-label="パンくず" className="text-sm text-civ-muted">
      <ol className="flex flex-wrap items-center gap-1.5 list-none m-0 p-0">
        <li>
          <Link href="/observation" className="text-civ-muted no-underline hover:text-civ-info">
            観測
          </Link>
        </li>
        <li aria-hidden="true">›</li>
        <li>
          <Link href="/observation" className="text-civ-muted no-underline hover:text-civ-info">
            検索
          </Link>
        </li>
        <li aria-hidden="true">›</li>
        <li aria-current="page" className="text-civ-fg">
          個体詳細
        </li>
      </ol>
    </nav>
  );
}

export default function ObservationDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  useEffect(() => {
    setLoading(true);
    setErrorState(null);
    api
      .get<DetailResponse>(`/api/v1/observation/${id}`)
      .then(setData)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          setErrorState({
            kind: "empty",
            title: `capture_id=${id} の観測データがありません`,
            description: e.message,
          });
          return;
        }
        setErrorState({
          kind: "error",
          title: "観測データの取得に失敗しました",
          description: e instanceof ApiError ? e.message : "通信またはサーバー処理で失敗しました",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <PageColumn className="max-w-6xl">
        <StatePanel kind="loading" title="観測詳細を読み込み中" />
      </PageColumn>
    );
  }

  if (errorState || !data) {
    return (
      <PageColumn className="max-w-6xl">
        <Stack>
          <ObservationBreadcrumb />
          <StatePanel
            kind={errorState?.kind ?? "error"}
            title={errorState?.title ?? "観測データを表示できません"}
            description={errorState?.description}
          />
          <Link href="/observation" className="text-sm text-civ-info">
            検索に戻る
          </Link>
        </Stack>
      </PageColumn>
    );
  }

  return (
    <PageColumn className="max-w-6xl">
      <Stack>
        <ObservationBreadcrumb />
        <ObservationDetailSections
          captureId={id}
          displayName={data.capture.display_name}
          capture={data.capture}
          measurements={data.measurements}
          photoConditions={data.photo_conditions}
          devices={data.devices}
          environmentSnapshot={data.environment_snapshot}
          similar={data.similar}
          imageUrl={data.capture.image_url}
          photoAbsentReason={data.capture.photo_absent_reason}
        />
      </Stack>
    </PageColumn>
  );
}
