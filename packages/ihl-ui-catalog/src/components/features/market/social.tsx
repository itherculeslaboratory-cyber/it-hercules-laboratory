import type { W2ComponentProps } from "../../../types/w2";
import { hot, MarketBody, MarketCrumb, MarketPrimary, MarketShell, MarketStatePanel, MarketTabs, StatusChip } from "./shared";

const ID = "ihl-06-market-social";

export function MarketSocialContentArea({ state = "ok", onAction, className }: W2ComponentProps) {
  return (
    <MarketShell componentId={`${ID}__ContentArea`} state={state} className={className}>
      <MarketCrumb parts={[{ label: "マーケット" }, { label: "ソーシャル" }]} />
      <MarketTabs
        tabs={[
          { id: "qa", label: "Q&A", active: true },
          { id: "praise", label: "称賛" },
          { id: "offer", label: "未出品オファー" },
          { id: "love", label: "ラブレター" },
        ]}
      />
      <MarketBody state={state}>
        <div className="ihl-mkt-social-layout">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 className="ihl-mkt-panel__head">Q&A 一覧</h2>
              <select className="ihl-form-control ihl-form-select" aria-label="並び替え">
                <option>最新順</option>
              </select>
            </div>
            {[
              { title: "この標本の学名についてご意見をいただけますか？", answered: true },
              { title: "飼育温度の記録方法について", answered: false },
              { title: "幼虫の食草変更タイミング", answered: true },
            ].map((q) => (
              <article key={q.title} className="ihl-mkt-qa-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span className="ihl-mkt__crumb">カブトムシ研究者 · 2時間前</span>
                  <StatusChip kind={q.answered ? "listed" : "sold"}>
                    {q.answered ? "回答済" : "未回答"}
                  </StatusChip>
                </div>
                <h3>Q {q.title}</h3>
                <p>標本ラベルと現行分類の整合性について、コミュニティの知見をお借りしたいです。</p>
                <StatusChip kind="priority">カブトムシ</StatusChip>
              </article>
            ))}
            <button type="button" className="ihl-mkt-tabs__tab">
              もっと見る ▾
            </button>
          </div>
          <aside>
            <div className="ihl-mkt-panel">
              <h2 className="ihl-mkt-panel__head">クイック統計</h2>
              <p style={{ fontSize: "1.5rem", color: "var(--civ-link)", margin: "0 0 8px" }}>
                24 件
              </p>
              <p className="ihl-mkt__crumb">公開質問</p>
              <ul className="ihl-mkt-checklist">
                <li>回答済み: 18件</li>
                <li>未回答: 6件</li>
                <li>今週の新規: 7件</li>
              </ul>
            </div>
            <div className="ihl-mkt-panel">
              <h2 className="ihl-mkt-panel__head">Q&Aの使い方</h2>
              <ol className="ihl-mkt-panel__lead" style={{ paddingLeft: 20 }}>
                <li>知りたいことを質問しましょう</li>
                <li>回答を待ちましょう</li>
                <li>知識を共有しましょう</li>
              </ol>
            </div>
          </aside>
        </div>
      </MarketBody>
    </MarketShell>
  );
}

export function MarketSocialPrimaryAction({ onAction, className }: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} className={className}>
      <MarketPrimary onClick={() => hot(onAction, 0)} testId="social-post-qa">
        質問を投稿
      </MarketPrimary>
      <button type="button" className="ihl-mkt-tabs__tab" style={{ marginTop: 12 }} onClick={() => hot(onAction, 1)}>
        マーケットへ
      </button>
    </div>
  );
}

export function MarketSocialStatePanel(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`}>
      <MarketStatePanel {...props} />
    </div>
  );
}
