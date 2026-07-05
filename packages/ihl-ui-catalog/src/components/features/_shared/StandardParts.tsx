import type { W2ComponentProps } from "../../../types/w2";
import { PrimaryButton } from "../../PrimaryButton";
import { fireHotspot, resolveConfig } from "./configs";
import { FeaturePartShell } from "./FeaturePartShell";
import type { ScreenFeatureConfig } from "./types";

type PartProps = W2ComponentProps & { componentId: string };

function NavLinks({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  const navItems = config.items.filter((i) => i.label.includes("ハブ") || i.label.includes("ホーム") || i.label.includes("プロフィール") || i.label.includes("設定"));
  if (navItems.length === 0) return null;
  return (
    <nav className="ihl-feature-nav" aria-label="補助ナビ">
      {navItems.map((item) => (
        <button key={item.hotspot} type="button" className="ihl-feature-nav__link" onClick={() => fireHotspot(onAction, item.hotspot)}>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function HubBody({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  return (
    <div className="ihl-feature-grid">
      {config.items.map((item) => (
        <button key={item.hotspot} type="button" className="ihl-feature-card" onClick={() => fireHotspot(onAction, item.hotspot)}>
          <span className="ihl-feature-card__label">{item.label}</span>
          {item.hint && <span className="ihl-feature-card__hint">{item.hint}</span>}
        </button>
      ))}
    </div>
  );
}

function ThreadBody({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  const posts =
    config.layout === "thread" && config.title.includes("通知")
      ? [
          { author: "system", body: "Q&A 回答が届きました" },
          { author: "lab_user", body: "称賛バッジを受け取りました" },
        ]
      : [
          { author: "researcher_a", body: "観測テンプレの UI をもう少しコンパクトにできませんか？" },
          { author: "researcher_b", body: "賛成です。フィルタ位置も検討したい。" },
        ];

  return (
    <div className="ihl-feature-thread">
      {posts.map((p, i) => (
        <article key={i} className="ihl-feature-post">
          <div className="ihl-feature-post__meta">{p.author}</div>
          <p className="ihl-feature-post__body">{p.body}</p>
        </article>
      ))}
      <div className="ihl-feature-actions">
        {config.items.map((item) => (
          <button key={item.hotspot} type="button" className="ihl-feature-nav__link" onClick={() => fireHotspot(onAction, item.hotspot)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MetricsBody({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  const values =
    config.title === "カルマ概要"
      ? ["+128", "免罪符 2"]
      : config.title === "貢献度"
        ? ["Gold", "観測 42"]
        : ["128", "Gold", "12"];

  return (
    <div className="ihl-feature-metrics">
      {config.items.map((item, i) => (
        <button key={item.hotspot} type="button" className="ihl-feature-metric" onClick={() => fireHotspot(onAction, item.hotspot)}>
          <span className="ihl-feature-metric__value">{values[i] ?? "—"}</span>
          <span className="ihl-feature-metric__label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function ShopBody({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  return (
    <>
      <div className="ihl-feature-grid">
        {["免罪符 ×1", "PT 100", "テンプレ解錠"].map((label, i) => (
          <div key={label} className="ihl-feature-card" style={{ cursor: "default" }}>
            <span className="ihl-feature-card__label">{label}</span>
            <span className="ihl-feature-card__hint">{i === 0 ? "22 PT" : "ショップ商品"}</span>
          </div>
        ))}
      </div>
      <div className="ihl-feature-actions">
        {config.items.map((item) => (
          <button key={item.hotspot} type="button" className="ihl-feature-nav__link" onClick={() => fireHotspot(onAction, item.hotspot)}>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

function VoteBody({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  return (
    <>
      <button type="button" className="ihl-feature-card" style={{ width: "100%", maxWidth: 480 }} onClick={() => fireHotspot(onAction, "hotspot.0")}>
        <span className="ihl-feature-card__label">候補 A — 観測 UI 刷新案</span>
        <span className="ihl-feature-card__hint">クリックで選択</span>
      </button>
      <div className="ihl-feature-actions">
        {config.items.slice(1).map((item) => (
          <button key={item.hotspot} type="button" className="ihl-feature-nav__link" onClick={() => fireHotspot(onAction, item.hotspot)}>
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

function PairwiseBody({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  return (
    <>
      <div className="ihl-feature-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <button type="button" className="ihl-feature-card" onClick={() => fireHotspot(onAction, "hotspot.0")}>
          <span className="ihl-feature-card__label">案 A</span>
        </button>
        <button type="button" className="ihl-feature-card" onClick={() => fireHotspot(onAction, "hotspot.0")}>
          <span className="ihl-feature-card__label">案 B</span>
        </button>
      </div>
      <button type="button" className="ihl-feature-nav__link" onClick={() => fireHotspot(onAction, "hotspot.1")}>
        ホーム
      </button>
    </>
  );
}

function FormBody({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  return (
    <>
      <div className="ihl-form-field">
        <label className="ihl-form-field__label">公開ハンドル</label>
        <input className="ihl-form-control" defaultValue="kabutomushi_labo" readOnly />
      </div>
      <div className="ihl-form-field">
        <label className="ihl-form-field__label">メール（非公開）</label>
        <input className="ihl-form-control" type="email" defaultValue="you@example.com" readOnly />
      </div>
      <NavLinks config={config} onAction={onAction} />
    </>
  );
}

function DisputeBody({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  return (
    <div className="ihl-feature-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div className="ihl-feature-post">
        <div className="ihl-feature-post__meta">部屋 A</div>
        <p className="ihl-feature-post__body">指摘内容を整理してください。</p>
      </div>
      <div className="ihl-feature-post">
        <div className="ihl-feature-post__meta">部屋 B</div>
        <p className="ihl-feature-post__body">反論・合意形成スペース。</p>
      </div>
      <div className="ihl-feature-actions" style={{ gridColumn: "1 / -1" }}>
        {config.items.map((item) => (
          <button key={item.hotspot} type="button" className="ihl-feature-nav__link" onClick={() => fireHotspot(onAction, item.hotspot)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BuilderEntryBody({ config, onAction }: { config: ScreenFeatureConfig; onAction: W2ComponentProps["onAction"] }) {
  return (
    <div className="ihl-feature-actions">
      {config.items.map((item) => (
        <button key={item.hotspot} type="button" className="ihl-feature-card" onClick={() => fireHotspot(onAction, item.hotspot)}>
          <span className="ihl-feature-card__label">{item.label}</span>
          {item.hint && <span className="ihl-feature-card__hint">{item.hint}</span>}
        </button>
      ))}
    </div>
  );
}

function renderBody(config: ScreenFeatureConfig, onAction: W2ComponentProps["onAction"]) {
  switch (config.layout) {
    case "hub":
      return <HubBody config={config} onAction={onAction} />;
    case "thread":
      return <ThreadBody config={config} onAction={onAction} />;
    case "metrics":
      return <MetricsBody config={config} onAction={onAction} />;
    case "shop":
      return <ShopBody config={config} onAction={onAction} />;
    case "vote":
      return <VoteBody config={config} onAction={onAction} />;
    case "pairwise":
      return <PairwiseBody config={config} onAction={onAction} />;
    case "form":
      return <FormBody config={config} onAction={onAction} />;
    case "dispute":
      return <DisputeBody config={config} onAction={onAction} />;
    case "builder-entry":
      return <BuilderEntryBody config={config} onAction={onAction} />;
    default:
      return <HubBody config={config} onAction={onAction} />;
  }
}

export function createContentArea(componentId: string) {
  return function FeatureContentArea({ state = "ok", className, screenId, onAction }: PartProps) {
    const config = resolveConfig(componentId, screenId);
    if (!config) {
      return (
        <FeaturePartShell componentId={componentId} state="error" className={className}>
          <p>設定未登録</p>
        </FeaturePartShell>
      );
    }

    return (
      <FeaturePartShell componentId={componentId} state={state} className={className}>
        <p className="ihl-feature-shell__crumb">{config.breadcrumb}</p>
        <h2 className="ihl-feature-shell__title">{config.title}</h2>
        {config.lead && <p className="ihl-feature-shell__lead">{config.lead}</p>}
        <NavLinks config={config} onAction={onAction} />
        {renderBody(config, onAction)}
      </FeaturePartShell>
    );
  };
}

export function createPrimaryAction(componentId: string) {
  return function FeaturePrimaryAction({ state = "ok", className, screenId, onAction }: PartProps) {
    const config = resolveConfig(componentId, screenId);
    const label = config?.primaryLabel ?? "続ける";
    const hotspot = config?.primaryHotspot ?? "hotspot.0";

    return (
      <FeaturePartShell componentId={componentId} state={state} className={className} shell={false}>
        <PrimaryButton type="button" onClick={() => fireHotspot(onAction, hotspot)}>
          {label}
        </PrimaryButton>
      </FeaturePartShell>
    );
  };
}

export function createStatePanel(componentId: string) {
  return function FeatureStatePanel({ state = "ok", className }: PartProps) {
    return (
      <FeaturePartShell componentId={componentId} state={state} className={className} shell={false}>
        <div className="ihl-feature-state" aria-label="状態">
          {(["ok", "loading", "empty"] as const).map((s) => (
            <span key={s} className={["ihl-feature-state__pill", state === s ? "ihl-feature-state__pill--active" : ""].filter(Boolean).join(" ")}>
              {s}
            </span>
          ))}
        </div>
      </FeaturePartShell>
    );
  };
}
