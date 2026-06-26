"use client";

import { useCallback, useState } from "react";
import { api, ApiError } from "@/lib/api";

export interface CaptureItem {
  capture_id: string;
  individual_id?: string;
  species?: string;
  sex?: string;
  stage_name?: string;
  phase_label?: string;
  larva_subtype?: string;
  view_type?: string;
  thumbnail_path?: string;
  display_name?: string;
  capture_timestamp?: string;
  created_at?: string;
  observed_at?: string;
  key_measurements?: string[];
  has_photo?: boolean;
  photo_absent_reason?: "not_saved_at_commit" | "blob_missing" | null;
  image_url?: string | null;
}

interface SearchResponse {
  status: string;
  items: CaptureItem[];
  total: number;
  message?: string;
}

export interface ObservationFilters {
  species?: string;
  sex?: string;
  stage_name?: string;
  view_type?: string;
  limit?: number;
}

export function useObservationSearch() {
  const [items, setItems] = useState<CaptureItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  const search = useCallback(async (filters: ObservationFilters) => {
    setLoading(true);
    setError(null);
    setEmptyMessage(null);
    try {
      const res = await api.post<SearchResponse>("/api/v1/observation/search", {
        limit: 24,
        ...filters,
      });
      setItems(res.items);
      setTotal(res.total);
      if (res.status === "empty" || res.items.length === 0) {
        setEmptyMessage(res.message ?? "条件に一致する個体がありません");
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "検索に失敗しました");
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return { items, total, loading, error, emptyMessage, search };
}
