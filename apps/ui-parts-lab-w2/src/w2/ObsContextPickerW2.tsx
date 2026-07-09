import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";

import {

  hot,

  ObsBreadcrumb,

  ObsDeepNav,

  ObsScreenWrap,

} from "@ihl/ui-catalog/components/features/observation/obs-shared";

import { W2ShellOnly } from "./withW2Shell";

import {

  isApplyEnabled,

  mergeContextIntoDraft,

  type ObsSubspeciesStatus,

  writeObservationDraft,

  writeWorkflowContext,

} from "./observation-draft-lab";

import {

  addSubscription,

  applyQaAnswer,

  breadcrumbForNode,

  candidateToSubscription,

  DOMAIN_CHIPS,

  domainLabel,

  expandIdsForQuery,

  filterTreeNodes,

  findCandidate,

  getQaStep,

  initQaEngine,

  readSubscriptions,

  removeSubscription,

  searchTaxonCandidates,

  subscriptionToWorkflowContext,

  tagFacetHint,

  TREE_RANK_HINT,

  treeNodesForDomain,

  writeLastTargetId,

  type ObsDomain,

  type ObsSubscription,

  type ObsTaxonCandidate,

  type QaEngineState,

  type TreeNode,

} from "./obs-subscription-lab";



const CTX_ID = "ihl-05-obs-context-picker";



const METHODS = ["学名検索", "質問で絞る", "分類ツリー"] as const;



function ObsCard({ title, children, testId }: { title: string; children: ReactNode; testId?: string }) {

  return (

    <section className="obs-card" data-testid={testId} style={{ marginBottom: 16 }}>

      <h3 className="obs-context-section__label" style={{ marginTop: 0 }}>

        {title}

      </h3>

      {children}

    </section>

  );

}



function CandidateRow({

  candidate,

  selected,

  onSelect,

  onAdd,

}: {

  candidate: ObsTaxonCandidate;

  selected: boolean;

  onSelect: () => void;

  onAdd: () => void;

}) {

  return (

    <li

      className={["obs-tree__item", selected ? "obs-tree__item--selected" : ""].filter(Boolean).join(" ")}

      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}

    >

      <button

        type="button"

        style={{ flex: 1, textAlign: "left", background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}

        onClick={onSelect}

      >

        <strong style={{ fontSize: "0.875rem" }}>{candidate.displayJa}</strong>

        <div style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)", marginTop: 2 }}>

          {candidate.scientificName}

          {candidate.level === "subspecies" ? " · 亜種" : " · 種"}

        </div>

      </button>

      <button type="button" className="obs-btn-outline" style={{ fontSize: "0.75rem", padding: "4px 8px" }} onClick={onAdd}>

        登録リストに追加

      </button>

    </li>

  );

}



function RegistrationList({

  subscriptions,

  applyTargetId,

  onSelectApply,

  onRemove,

}: {

  subscriptions: ObsSubscription[];

  applyTargetId: string | null;

  onSelectApply: (id: string) => void;

  onRemove: (id: string) => void;

}) {

  if (subscriptions.length === 0) {

    return (

      <p style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)", margin: 0 }}>

        登録済み対象がありません。上のタブから対象を追加してください。

      </p>

    );

  }



  return (

    <ul className="obs-tree" data-testid="obs-subscription-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>

      {subscriptions.map((sub) => (

        <li

          key={sub.subscriptionId}

          className={["obs-tree__item", applyTargetId === sub.subscriptionId ? "obs-tree__item--selected" : ""]

            .filter(Boolean)

            .join(" ")}

          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}

        >

          <button

            type="button"

            style={{ flex: 1, textAlign: "left", background: "none", border: "none", color: "inherit", cursor: "pointer" }}

            onClick={() => onSelectApply(sub.subscriptionId)}

          >

            <strong style={{ fontSize: "0.875rem" }}>{sub.displayJa}</strong>

            <div style={{ fontSize: "0.7rem", color: "var(--civ-fg-muted)", marginTop: 2 }}>

              {domainLabel(sub.domain)} · {sub.level === "subspecies" ? "亜種" : "種"}

            </div>

          </button>

          <button

            type="button"

            className="obs-btn-ghost"

            aria-label={`${sub.displayJa} を登録から削除`}

            onClick={() => onRemove(sub.subscriptionId)}

          >

            削除

          </button>

        </li>

      ))}

    </ul>

  );

}



function TreeBranch({

  node,

  depth,

  expandedIds,

  selectedCandidateId,

  focusedNodeId,

  onToggle,

  onPick,

  onFocus,

  onAdd,

}: {

  node: TreeNode;

  depth: number;

  expandedIds: Set<string>;

  selectedCandidateId: string | null;

  focusedNodeId: string | null;

  onToggle: (id: string) => void;

  onPick: (candidateId: string) => void;

  onFocus: (id: string) => void;

  onAdd: (candidateId: string) => void;

}) {

  const hasChildren = Boolean(node.children?.length);

  const expanded = expandedIds.has(node.id);

  const isLeaf = Boolean(node.candidateId);

  const selected = node.candidateId && selectedCandidateId === node.candidateId;

  const focused = focusedNodeId === node.id;



  return (

    <li className="obs-taxtree__row">

      <div

        className={[

          "obs-taxtree__item",

          selected ? "obs-tree__item--selected" : "",

          focused ? "obs-taxtree__item--focused" : "",

        ]

          .filter(Boolean)

          .join(" ")}

        style={{ paddingLeft: `${8 + depth * 18}px` }}

      >

        {hasChildren ? (

          <button

            type="button"

            className="obs-taxtree__toggle"

            aria-expanded={expanded}

            aria-label={expanded ? "折りたたむ" : "展開する"}

            onClick={() => onToggle(node.id)}

          >

            {expanded ? "▼" : "▶"}

          </button>

        ) : (

          <span className="obs-taxtree__toggle obs-taxtree__toggle--spacer" aria-hidden />

        )}

        <button

          type="button"

          className="obs-taxtree__label"

          onClick={() => {

            onFocus(node.id);

            if (node.candidateId) onPick(node.candidateId);

          }}

        >

          {node.label}

        </button>

        {isLeaf && node.candidateId && (

          <button

            type="button"

            className="obs-btn-outline obs-taxtree__add"

            onClick={() => onAdd(node.candidateId!)}

          >

            追加

          </button>

        )}

      </div>

      {hasChildren && expanded && (

        <ul className="obs-taxtree__children">

          {node.children!.map((child) => (

            <TreeBranch

              key={child.id}

              node={child}

              depth={depth + 1}

              expandedIds={expandedIds}

              selectedCandidateId={selectedCandidateId}

              focusedNodeId={focusedNodeId}

              onToggle={onToggle}

              onPick={onPick}

              onFocus={onFocus}

              onAdd={onAdd}

            />

          ))}

        </ul>

      )}

    </li>

  );

}



function TaxonomyTreePanel({

  nodes,

  selectedCandidateId,

  onPick,

  onAdd,

}: {

  nodes: TreeNode[];

  selectedCandidateId: string | null;

  onPick: (candidateId: string) => void;

  onAdd: (candidateId: string) => void;

}) {

  const [treeQuery, setTreeQuery] = useState("");

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(["bio", "insect"]));

  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);



  const filteredNodes = useMemo(() => filterTreeNodes(nodes, treeQuery), [nodes, treeQuery]);



  useEffect(() => {

    if (treeQuery.trim()) {

      const auto = expandIdsForQuery(nodes, treeQuery);

      setExpandedIds((prev) => new Set([...prev, ...auto]));

    }

  }, [treeQuery, nodes]);



  const crumbs = useMemo(() => {

    if (!focusedNodeId) return [];

    return breadcrumbForNode(nodes, focusedNodeId);

  }, [focusedNodeId, nodes]);



  const toggle = (id: string) => {

    setExpandedIds((prev) => {

      const next = new Set(prev);

      if (next.has(id)) next.delete(id);

      else next.add(id);

      return next;

    });

  };



  return (

    <div data-testid="obs-tab-taxonomy-tree">

      <input

        type="search"

        className="ihl-form-control obs-taxtree__search"

        placeholder="分類ツリー内を検索（学名・和名）"

        aria-label="分類ツリー検索"

        value={treeQuery}

        onChange={(e) => setTreeQuery(e.target.value)}

      />

      {crumbs.length > 0 && (

        <nav className="obs-taxtree__crumbs" aria-label="分類パス">

          {crumbs.map((c, i) => (

            <span key={c.id} className="obs-taxtree__crumb">

              {i > 0 && <span className="obs-taxtree__crumb-sep">›</span>}

              <button type="button" onClick={() => setFocusedNodeId(c.id)}>

                {TREE_RANK_HINT[i] ? `${TREE_RANK_HINT[i]}: ` : ""}

                {c.label.split(" ")[0]}

              </button>

            </span>

          ))}

        </nav>

      )}

      {filteredNodes.length === 0 ? (

        <p role="status" style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)", margin: "8px 0 0" }}>

          一致する分類がありません。

        </p>

      ) : (

        <ul className="obs-taxtree" data-testid="obs-taxonomy-tree">

          {filteredNodes.map((node) => (

            <TreeBranch

              key={node.id}

              node={node}

              depth={0}

              expandedIds={expandedIds}

              selectedCandidateId={selectedCandidateId}

              focusedNodeId={focusedNodeId}

              onToggle={toggle}

              onPick={onPick}

              onFocus={setFocusedNodeId}

              onAdd={onAdd}

            />

          ))}

        </ul>

      )}

    </div>

  );

}



function QaNarrowPanel({

  domain,

  qaState,

  onStateChange,

  onSelectCandidate,

  onAdd,

}: {

  domain: ObsDomain;

  qaState: QaEngineState;

  onStateChange: (s: QaEngineState) => void;

  onSelectCandidate: (c: ObsTaxonCandidate) => void;

  onAdd: (c: ObsTaxonCandidate) => void;

}) {

  const step = useMemo(() => getQaStep(qaState), [qaState]);



  const handleOption = (value: string, label: string) => {

    if (value.startsWith("tax-")) {

      const c = findCandidate(value);

      if (c) {

        onSelectCandidate(c);

        onAdd(c);

      }

      return;

    }

    onStateChange(applyQaAnswer(qaState, value, step.question, label));

  };



  const handleReset = () => onStateChange(initQaEngine(domain));



  if (step.done && step.resultCandidates.length === 1) {

    const result = step.resultCandidates[0]!;

    return (

      <div data-testid="obs-tab-qa-narrow">

        <p className="obs-qa__progress">残り 1 候補</p>

        <p style={{ fontSize: "0.875rem", margin: "0 0 12px" }}>{step.question}</p>

        <CandidateRow

          candidate={result}

          selected

          onSelect={() => onSelectCandidate(result)}

          onAdd={() => onAdd(result)}

        />

        {qaState.history.length > 0 && (

          <details className="obs-qa__history" style={{ marginTop: 12 }}>

            <summary style={{ fontSize: "0.8125rem", cursor: "pointer", color: "var(--civ-fg-muted)" }}>

              質問の履歴（{qaState.history.length} 問）

            </summary>

            <ol style={{ fontSize: "0.75rem", margin: "8px 0 0", paddingLeft: 20 }}>

              {qaState.history.map((h, i) => (

                <li key={i}>

                  {h.question} → <strong>{h.answer}</strong>

                </li>

              ))}

            </ol>

          </details>

        )}

        <button type="button" className="obs-btn-ghost" style={{ marginTop: 12, fontSize: "0.8125rem" }} onClick={handleReset}>

          最初からやり直す

        </button>

      </div>

    );

  }



  return (

    <div data-testid="obs-tab-qa-narrow">

      <p className="obs-qa__progress" role="status">

        残り <strong>{step.remaining}</strong> 候補

      </p>

      <p style={{ fontSize: "0.875rem", margin: "0 0 12px" }}>{step.question}</p>

      <div className="obs-chip-row obs-qa__options">

        {step.options.map((opt) => (

          <button

            key={opt.value}

            type="button"

            className="obs-chip"

            onClick={() => handleOption(opt.value, opt.label)}

          >

            {opt.label}

          </button>

        ))}

      </div>

      {qaState.history.length > 0 && (

        <details className="obs-qa__history" style={{ marginTop: 12 }}>

          <summary style={{ fontSize: "0.8125rem", cursor: "pointer", color: "var(--civ-fg-muted)" }}>

            これまでの回答（{qaState.history.length} 問）

          </summary>

          <ol style={{ fontSize: "0.75rem", margin: "8px 0 0", paddingLeft: 20 }}>

            {qaState.history.map((h, i) => (

              <li key={i}>

                {h.question} → <strong>{h.answer}</strong>

              </li>

            ))}

          </ol>

        </details>

      )}

      <button type="button" className="obs-btn-ghost" style={{ marginTop: 8, fontSize: "0.8125rem" }} onClick={handleReset}>

        最初からやり直す

      </button>

    </div>

  );

}



/** 3101 専用 — 05ctx 対象ナビゲータ + 観測対象の登録（user gate G1–G6 · OBS-TGT-02 文字のみ） */

export function ObsContextPickerContentAreaW2({ onAction, onNavigate, className }: W2ComponentProps) {

  const [domainIdx, setDomainIdx] = useState(0);

  const [method, setMethod] = useState(2);

  const [subscriptions, setSubscriptions] = useState(() => readSubscriptions());

  const [pendingCandidate, setPendingCandidate] = useState<ObsTaxonCandidate | null>(null);

  const [applyTargetId, setApplyTargetId] = useState<string | null>(

    () => subscriptions[0]?.subscriptionId ?? null,

  );

  const [subspecies, setSubspecies] = useState<ObsSubspeciesStatus>("subspecies");

  const [scientificQuery, setScientificQuery] = useState("");

  const [qaState, setQaState] = useState<QaEngineState | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [addOnApply, setAddOnApply] = useState(true);



  const domain = (DOMAIN_CHIPS[domainIdx]?.key ?? "biological") as ObsDomain;



  const domainTreeNodes = useMemo(() => treeNodesForDomain(domain), [domain]);



  const refreshSubs = useCallback(() => {

    const next = readSubscriptions();

    setSubscriptions(next);

    setApplyTargetId((prev) => {

      if (prev && next.some((s) => s.subscriptionId === prev)) return prev;

      return next[0]?.subscriptionId ?? null;

    });

  }, []);



  useEffect(() => {

    refreshSubs();

  }, [refreshSubs]);



  useEffect(() => {

    setQaState(initQaEngine(domain));

  }, [domain]);



  const searchResults = useMemo(() => {

    if (method !== 0) return [];

    return searchTaxonCandidates(scientificQuery, domain);

  }, [method, scientificQuery, domain]);



  const pendingTags = pendingCandidate?.tags ?? [];

  const treeSelected = Boolean(pendingCandidate);

  const applyEnabled = pendingCandidate

    ? isApplyEnabled(pendingCandidate.subspeciesStatus, treeSelected)

    : Boolean(applyTargetId);



  const handleSelectCandidate = (candidate: ObsTaxonCandidate) => {

    setPendingCandidate(candidate);

    setSubspecies(candidate.subspeciesStatus);

  };



  const handleAddRegistration = (candidate: ObsTaxonCandidate) => {

    addSubscription(candidate);

    refreshSubs();

    const added = readSubscriptions().find((s) => s.id === candidate.id);

    if (added) setApplyTargetId(added.subscriptionId);

    hot(onAction, 13);

  };



  const handleApply = () => {

    setLoading(true);

    setError(null);

    try {

      const subsNow = readSubscriptions();

      let sub: ObsSubscription | null = null;



      if (pendingCandidate && addOnApply) {

        sub = addSubscription(pendingCandidate);

      } else if (applyTargetId) {

        sub = subsNow.find((s) => s.subscriptionId === applyTargetId) ?? null;

      }



      if (!sub && pendingCandidate) {

        sub = candidateToSubscription(pendingCandidate);

      }



      if (!sub) {

        setError("適用する対象を選ぶか、登録済み対象から選択してください");

        setLoading(false);

        return;

      }



      const ctx = subscriptionToWorkflowContext(sub, "unknown");

      ctx.subspeciesStatus = subspecies;

      writeWorkflowContext(ctx);

      writeObservationDraft(mergeContextIntoDraft(ctx));

      writeLastTargetId(sub.subscriptionId);

      refreshSubs();

      hot(onAction, 11);

      onNavigate?.("05a", {

        species: sub.speciesName,

        stage: ctx.stage,

        domain: sub.domain,

        subscription_id: sub.subscriptionId,

      });

    } catch {

      setError("コンテキストの保存に失敗しました");

    } finally {

      setLoading(false);

    }

  };



  return (

    <W2ShellOnly feature="obs">

      <ObsScreenWrap className={className} componentId={`${CTX_ID}__ContentArea`}>

        <ObsBreadcrumb segments={["観測", "対象ナビゲータ"]} />



        <div className="obs-step-indicator">

          <span className="obs-step-indicator__item obs-step-indicator__item--active">

            <span className="obs-step-indicator__num">①</span> ドメイン

          </span>

          <span>—</span>

          <span className="obs-step-indicator__item obs-step-indicator__item--active">

            <span className="obs-step-indicator__num">②</span> 絞り込み

          </span>

          <span>—</span>

          <span className={`obs-step-indicator__item${applyEnabled ? " obs-step-indicator__item--active" : ""}`}>

            <span className="obs-step-indicator__num">③</span> 登録・確認

          </span>

        </div>



        {error && (

          <div className="obs-card" role="alert" style={{ borderColor: "var(--civ-danger)", marginBottom: 16 }}>

            {error}

            <button type="button" className="obs-btn-outline" style={{ marginTop: 8 }} onClick={() => setError(null)}>

              再試行

            </button>

          </div>

        )}



        <div className="obs-context-sheet obs-card" data-testid="obs-context-picker">

          <div className="obs-context-section">

            <h2 className="obs-page-title" style={{ fontSize: "1.125rem", margin: "0 0 12px" }}>

              何を観測しますか？

            </h2>

            <p className="obs-context-section__label">① ドメイン</p>

            <div className="obs-chip-row">

              {DOMAIN_CHIPS.map((d, i) => (

                <button

                  key={d.key}

                  type="button"

                  className={i === domainIdx ? "obs-chip obs-chip--active" : "obs-chip"}

                  onClick={() => {

                    setDomainIdx(i);

                    setPendingCandidate(null);

                    setScientificQuery("");

                    hot(onAction, i);

                  }}

                >

                  {d.label}

                </button>

              ))}

            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--civ-fg-muted)", margin: "8px 0 0" }}>

              {tagFacetHint(domain)}

            </p>

          </div>



          <div className="obs-context-section">

            <p className="obs-context-section__label">② 絞り込み方法</p>

            <div className="obs-tabs">

              {METHODS.map((m, i) => (

                <button

                  key={m}

                  type="button"

                  className={i === method ? "obs-tab obs-tab--active" : "obs-tab"}

                  onClick={() => {

                    setMethod(i);

                    hot(onAction, i + 5);

                    if (i === 1) setQaState(initQaEngine(domain));

                  }}

                >

                  {m}

                </button>

              ))}

            </div>



            {method === 0 && (

              <div data-testid="obs-tab-scientific-search">

                <input

                  type="search"

                  className="ihl-form-control"

                  placeholder="学名・和名で検索（例: hercules, ヘラクレス, Dynastes）"

                  aria-label="学名検索"

                  value={scientificQuery}

                  onChange={(e) => setScientificQuery(e.target.value)}

                  style={{ width: "100%", marginBottom: 12 }}

                />

                {!scientificQuery.trim() && (

                  <p style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)", margin: "0 0 8px" }}>

                    学名または和名を入力すると候補が表示されます（文字のみ · サムネなし）

                  </p>

                )}

                {scientificQuery.trim() && searchResults.length === 0 && (

                  <p role="status" style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)" }}>

                    候補が見つかりません。別のキーワードを試してください。

                  </p>

                )}

                <ul className="obs-tree" style={{ listStyle: "none", padding: 0 }}>

                  {searchResults.map((c) => (

                    <CandidateRow

                      key={c.id}

                      candidate={c}

                      selected={pendingCandidate?.id === c.id}

                      onSelect={() => handleSelectCandidate(c)}

                      onAdd={() => handleAddRegistration(c)}

                    />

                  ))}

                </ul>

              </div>

            )}



            {method === 1 && qaState && (

              <QaNarrowPanel

                domain={domain}

                qaState={qaState}

                onStateChange={setQaState}

                onSelectCandidate={handleSelectCandidate}

                onAdd={handleAddRegistration}

              />

            )}



            {method === 2 && (

              <>

                {domainTreeNodes.length === 0 ? (

                  <p style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)", margin: 0 }}>

                    {domain === "digital" && "デジタル作品は「質問で絞る」タブから選択できます（lab stub）。"}

                    {domain === "environment" && "環境ドメインの分類ツリーは Phase 3 接続予定です。"}

                    {domain === "custom" && "カスタム対象は「質問で絞る」または学名検索で追加してください。"}

                  </p>

                ) : loading ? (

                  <ul className="obs-tree" aria-busy="true">

                    {[1, 2, 3].map((n) => (

                      <li key={n} className="obs-tree__item" style={{ opacity: 0.4 }}>

                        読み込み中…

                      </li>

                    ))}

                  </ul>

                ) : (

                  <TaxonomyTreePanel

                    nodes={domainTreeNodes}

                    selectedCandidateId={pendingCandidate?.id ?? null}

                    onPick={(id) => {

                      const c = findCandidate(id);

                      if (c) handleSelectCandidate(c);

                      hot(onAction, 8);

                    }}

                    onAdd={(id) => {

                      const c = findCandidate(id);

                      if (c) {

                        handleSelectCandidate(c);

                        handleAddRegistration(c);

                      }

                    }}

                  />

                )}

              </>

            )}



            {pendingCandidate && domain === "biological" && pendingCandidate.subspeciesStatus === "subspecies" && (

              <div className="obs-subspecies-row" style={{ marginTop: 12 }}>

                <button

                  type="button"

                  className={subspecies === "subspecies" ? "obs-chip obs-chip--active" : "obs-chip"}

                  onClick={() => setSubspecies("subspecies")}

                >

                  亜種まで確定

                </button>

                <button

                  type="button"

                  className={subspecies === "species_only" ? "obs-chip obs-chip--active" : "obs-chip"}

                  onClick={() => setSubspecies("species_only")}

                >

                  亜種未区別（種まで）

                </button>

              </div>

            )}



            {!applyEnabled && pendingCandidate?.subspeciesStatus === "unresolved" && (

              <p style={{ fontSize: "0.8125rem", color: "var(--civ-warning, #FFD66B)", margin: "8px 0 0" }}>

                亜種が不明なら「亜種未区別（種まで）」を選んでください

              </p>

            )}

          </div>



          <ObsCard title="③ 観測対象の登録">

            <p style={{ fontSize: "0.8125rem", color: "var(--civ-fg-muted)", margin: "0 0 12px" }}>

              観測したい対象を登録しておきます。05a 検索は登録済み対象からのみ選べます。

            </p>

            <RegistrationList

              subscriptions={subscriptions}

              applyTargetId={applyTargetId}

              onSelectApply={setApplyTargetId}

              onRemove={(id) => {

                removeSubscription(id);

                refreshSubs();

              }}

            />

          </ObsCard>



          {pendingTags.length > 0 && (

            <div className="obs-tag-list">

              {pendingTags.map((t) => (

                <span key={t} className="obs-tag">

                  {t}

                </span>

              ))}

            </div>

          )}



          <p style={{ margin: "12px 0", fontSize: "0.8125rem", color: "var(--civ-fg-muted)", lineHeight: 1.6 }}>

            〔適用〕で WorkflowContext を更新し、検索（05a）・計測入力（05i）・テンプレ（05tl）の初期スコープになります。

            タグ facet はドメインで切り替わります（昆虫 order:Coleoptera · 魚 class:Actinopterygii）。

          </p>



          <label className="obs-toggle-row" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>

            <input

              type="checkbox"

              checked={addOnApply}

              onChange={(e) => setAddOnApply(e.target.checked)}

              aria-label="選択中の対象を登録リストに追加"

            />

            <span style={{ fontSize: "0.8125rem" }}>選択中の対象を登録リストに追加してから適用</span>

          </label>



          <div className="obs-apply-bar">

            <button

              type="button"

              className="obs-btn-primary"

              data-testid="obs-context-apply"

              style={{ width: "100%", opacity: applyEnabled ? 1 : 0.45 }}

              disabled={!applyEnabled || loading}

              onClick={handleApply}

            >

              適用

            </button>

            <div className="obs-apply-bar__actions">

              <button type="button" className="obs-btn-outline" onClick={() => onNavigate?.("05i")}>

                計測入力へ

              </button>

              <button type="button" className="obs-btn-outline" onClick={() => onNavigate?.("05tl")}>

                テンプレ一覧

              </button>

            </div>

          </div>

        </div>



        <ObsDeepNav

          onAction={onAction}

          links={[

            { label: "検索グリッド", hotspot: 10 },

            { label: "計測入力", hotspot: 11 },

            { label: "テンプレ一覧", hotspot: 12 },

          ]}

        />

      </ObsScreenWrap>

    </W2ShellOnly>

  );

}



export function ObsContextPickerPrimaryActionW2(_props: W2ComponentProps) {

  return null;

}



export function ObsContextPickerStatePanelW2(_props: W2ComponentProps) {

  return null;

}


