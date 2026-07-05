import type { ReactNode } from "react";
import { PrimaryButton } from "../components/PrimaryButton";
import type { W2ComponentProps, W2PartState } from "../types/w2";
import "./region-part.css";

export type PartMeta = {
  id: string;
  region: string;
  primitive: string;
  mock: string;
  label: string;
};

function stateClass(state: W2PartState): string {
  if (state === "loading") return "ihl-region-part--loading";
  if (state === "empty") return "ihl-region-part--empty";
  if (state === "error") return "ihl-region-part--error";
  return "";
}

function humanRegion(region: string): string {
  return region.replace(/([A-Z])/g, " $1").trim();
}

function renderBody(meta: PartMeta, props: W2ComponentProps): ReactNode {
  const { state = "ok", onNavigate, onAction } = props;
  const region = meta.region;

  if (state === "empty") {
    return <p>データがありません</p>;
  }
  if (state === "error") {
    return <p>読み込みに失敗しました</p>;
  }
  if (state === "loading") {
    return <p>読み込み中…</p>;
  }

  if (region === "PrimaryAction") {
    return (
      <PrimaryButton
        type="button"
        onClick={() => onAction?.("primary")}
      >
        {meta.label.includes("はじめる") ? "はじめる" : "続ける"}
      </PrimaryButton>
    );
  }

  if (region === "SearchFilterBar") {
    return (
      <div className="ihl-region-filter">
        <input className="ihl-form-control" placeholder="検索…" aria-label="検索" />
        <select className="ihl-form-control ihl-form-select" aria-label="フィルタ">
          <option>すべて</option>
        </select>
      </div>
    );
  }

  if (region === "ResultGridCard" || region === "ContentArea") {
    return (
      <div className="ihl-region-grid">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            className="ihl-region-grid__card"
            onClick={() => onNavigate?.("05b")}
          >
            項目 {n}
          </button>
        ))}
      </div>
    );
  }

  if (region === "Pagination") {
    return (
      <div className="ihl-region-pagination">
        <button type="button">‹</button>
        <button type="button">1</button>
        <button type="button">›</button>
      </div>
    );
  }

  if (region === "EmptyState") {
    return <p>該当する結果はありません</p>;
  }

  if (region === "StatePanel") {
    return (
      <div className="ihl-region-state-panel">
        <span>ok</span>
        <span>loading</span>
        <span>empty</span>
      </div>
    );
  }

  if (region === "PageHeader") {
    return (
      <>
        <h2 className="ihl-region-shell__title">{humanRegion(meta.mock.replace(".png", "").replace("ihl-", ""))}</h2>
      </>
    );
  }

  return <p>{humanRegion(region)}</p>;
}

/** 生成部品の共通レンダラ（region × primitive × state） */
export function RegionPart({ meta, ...props }: { meta: PartMeta } & W2ComponentProps) {
  const state = props.state ?? "ok";
  const isShell = !["PrimaryAction", "Pagination", "EmptyState", "StatePanel"].includes(meta.region);

  return (
    <section
      className={[
        "ihl-region-part",
        stateClass(state),
        isShell ? "ihl-region-shell" : "",
        props.className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-component-id={meta.id}
      data-region={meta.region}
      data-state={state}
    >
      {renderBody(meta, props)}
    </section>
  );
}
