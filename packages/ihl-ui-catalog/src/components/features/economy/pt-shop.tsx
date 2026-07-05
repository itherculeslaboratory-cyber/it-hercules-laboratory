import type { ReactNode } from "react";
import { PrimaryButton } from "../../PrimaryButton";
import type { W2ComponentProps } from "../../../types/w2";
import "./economy.css";

const ID = "ihl-22-pt-shop";

export function hot(onAction: W2ComponentProps["onAction"], index: number) {
  onAction?.(`hotspot.${index}`);
}

function ShopShell({ componentId, state = "ok", className, children }: W2ComponentProps & { componentId: string; children: ReactNode }) {
  return (
    <section className={["ihl-shop", className].filter(Boolean).join(" ")} data-component-id={componentId} data-state={state}>
      {children}
    </section>
  );
}

export function PtShopNullStatePanel(_props: W2ComponentProps) {
  return null;
}

export function PtShopContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <ShopShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <p className="ihl-shop__crumb">
        経済 › ショップ
        <span className="ihl-shop__balance">残高 12 PT</span>
      </p>
      <div className="ihl-shop-card">
        <div className="ihl-shop-card__head">
          <span className="ihl-shop-card__icon">📜</span>
          <div>
            <h2 className="ihl-shop-card__title">黄金ヘラクレス教の免罪符</h2>
            <p className="ihl-shop-card__desc">カルマカウントを 1 下げます（0 未満にはなりません）</p>
          </div>
        </div>
        <div className="ihl-shop-card__price">
          <div>
            <span className="ihl-shop-card__label">次回購入価格</span>
            <strong className="ihl-shop-card__pt">1 PT</strong>
            <span className="ihl-shop-card__stage">価格段階 n=1</span>
          </div>
          <div className="ihl-shop-card__logic">
            購入ごとに 1 → 1 → 2 → 3 → 5 → 8 PT と上昇
            <br />
            毎月 1 段階下がる
          </div>
        </div>
      </div>
      <h3 className="ihl-shop__subtitle">購入履歴</h3>
      <table className="ihl-shop-history">
        <thead>
          <tr>
            <th>日時</th>
            <th>価格 (PT)</th>
            <th>段階</th>
            <th>備考</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2025/05/20 14:32</td>
            <td>1</td>
            <td>n=1</td>
            <td>購入</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button type="button" className="ihl-shop__link" onClick={() => hot(onAction, 0)}>
          貢献度へ
        </button>
        <button type="button" className="ihl-shop__link" onClick={() => hot(onAction, 1)}>
          一般投票へ
        </button>
      </div>
      <p className="ihl-shop__footnote">上限なし · 連続購入は価格上昇で自然に抑制</p>
    </ShopShell>
  );
}

export function PtShopPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <PrimaryButton type="button" onClick={() => hot(onAction, 0)}>
        購入する (1 PT)
      </PrimaryButton>
    </div>
  );
}

export { PtShopNullStatePanel as PtShopStatePanel };
