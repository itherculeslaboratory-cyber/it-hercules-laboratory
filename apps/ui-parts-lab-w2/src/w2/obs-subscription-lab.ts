/**
 * 3101 lab — 観測対象の登録（subscription モデル · user gate G1–G3）
 * localStorage: ihl.observation.subscriptions.v1 · ihl.observation.last_target.v1
 *
 * タグ facet は domain 依存（昆虫 vs 魚 vs 器物）— WorkflowContext.tags に反映。
 * UI 表層は「観測対象の登録」「登録済み対象」（YouTube 比喩は設計 doc のみ）。
 */

import type { ObsSubspeciesStatus, ObsWorkflowContext } from "./observation-draft-lab";

export const OBS_SUBSCRIPTIONS_KEY = "ihl.observation.subscriptions.v1";
export const OBS_LAST_TARGET_KEY = "ihl.observation.last_target.v1";

export type ObsDomain =
  | "biological"
  | "artifact"
  | "digital"
  | "environment"
  | "custom";

export type ObsSubscriptionLevel = "species" | "subspecies";

export type ObsTaxonCandidate = {
  id: string;
  domain: ObsDomain;
  displayJa: string;
  scientificName: string;
  speciesName: string;
  level: ObsSubscriptionLevel;
  subspeciesStatus: ObsSubspeciesStatus;
  searchTerms: string[];
  tags: string[];
};

export type ObsSubscription = ObsTaxonCandidate & {
  subscriptionId: string;
  addedAt: string;
};

/** mock taxonomy — 文字のみ（OBS-TGT-02） */
export const TAXON_CANDIDATES: ObsTaxonCandidate[] = [
  {
    id: "tax-dhh",
    domain: "biological",
    displayJa: "Dynastes hercules hercules · 原名亜種",
    scientificName: "Dynastes hercules hercules",
    speciesName: "Dynastes hercules",
    level: "subspecies",
    subspeciesStatus: "subspecies",
    searchTerms: ["hercules", "ヘラクレス", "dynastes", "原名", "h. hercules"],
    tags: [
      "domain:biological",
      "order:Coleoptera",
      "family:Scarabaeidae",
      "genus:Dynastes",
      "species:Dynastes hercules",
      "subspecies:D. h. hercules",
    ],
  },
  {
    id: "tax-dh",
    domain: "biological",
    displayJa: "Dynastes hercules · ヘラクレスオオカブト（種）",
    scientificName: "Dynastes hercules",
    speciesName: "Dynastes hercules",
    level: "species",
    subspeciesStatus: "species_only",
    searchTerms: ["hercules", "ヘラクレス", "dynastes", "種"],
    tags: [
      "domain:biological",
      "order:Coleoptera",
      "family:Scarabaeidae",
      "genus:Dynastes",
      "species:Dynastes hercules",
    ],
  },
  {
    id: "tax-dhb",
    domain: "biological",
    displayJa: "Dynastes hercules becerrae · ベセラエ亜種",
    scientificName: "Dynastes hercules becerrae",
    speciesName: "Dynastes hercules",
    level: "subspecies",
    subspeciesStatus: "subspecies",
    searchTerms: ["becerrae", "ベセラエ", "hercules"],
    tags: [
      "domain:biological",
      "order:Coleoptera",
      "family:Scarabaeidae",
      "genus:Dynastes",
      "species:Dynastes hercules",
      "subspecies:D. h. becerrae",
    ],
  },
  {
    id: "tax-ad",
    domain: "biological",
    displayJa: "Allomyrina dichotoma · カブトムシ（大）",
    scientificName: "Allomyrina dichotoma",
    speciesName: "Allomyrina dichotoma",
    level: "species",
    subspeciesStatus: "species_only",
    searchTerms: ["dichotoma", "カブト", "allomyrina", "大"],
    tags: [
      "domain:biological",
      "order:Coleoptera",
      "family:Scarabaeidae",
      "genus:Allomyrina",
      "species:Allomyrina dichotoma",
    ],
  },
  {
    id: "tax-goldfish",
    domain: "biological",
    displayJa: "Carassius auratus · 金魚",
    scientificName: "Carassius auratus",
    speciesName: "Carassius auratus",
    level: "species",
    subspeciesStatus: "species_only",
    searchTerms: ["金魚", "carassius", "auratus", "goldfish"],
    tags: [
      "domain:biological",
      "class:Actinopterygii",
      "order:Cypriniformes",
      "family:Cyprinidae",
      "species:Carassius auratus",
    ],
  },
  {
    id: "tax-koi",
    domain: "biological",
    displayJa: "Cyprinus carpio · コイ",
    scientificName: "Cyprinus carpio",
    speciesName: "Cyprinus carpio",
    level: "species",
    subspeciesStatus: "species_only",
    searchTerms: ["コイ", "鯉", "cyprinus", "carpio"],
    tags: [
      "domain:biological",
      "class:Actinopterygii",
      "order:Cypriniformes",
      "family:Cyprinidae",
      "species:Cyprinus carpio",
    ],
  },
  {
    id: "tax-plate",
    domain: "artifact",
    displayJa: "皿 · 陶器カテゴリ",
    scientificName: "category:plate",
    speciesName: "category:plate",
    level: "species",
    subspeciesStatus: "species_only",
    searchTerms: ["皿", "plate", "陶器"],
    tags: ["domain:artifact", "category:container", "item:plate"],
  },
];

export type TreeNode = {
  id: string;
  label: string;
  level: number;
  candidateId?: string;
  children?: TreeNode[];
};

/** 分類ツリー mock — 昆虫中心 + 魚枝 */
export const TAXON_TREE: TreeNode[] = [
  {
    id: "bio",
    label: "生物 biological",
    level: 0,
    children: [
      {
        id: "insect",
        label: "昆虫綱 Insecta",
        level: 1,
        children: [
          {
            id: "coleoptera",
            label: "目 Coleoptera 甲虫目",
            level: 2,
            children: [
              {
                id: "scarab",
                label: "科 Scarabaeidae コガネムシ科",
                level: 3,
                children: [
                  {
                    id: "dynastes-genus",
                    label: "属 Dynastes",
                    level: 4,
                    children: [
                      {
                        id: "dh-species",
                        label: "種 Dynastes hercules ヘラクレスオオカブト",
                        level: 5,
                        candidateId: "tax-dh",
                        children: [
                          {
                            id: "dhh",
                            label: "亜種 D. h. hercules 原名亜種",
                            level: 6,
                            candidateId: "tax-dhh",
                          },
                          {
                            id: "dhb",
                            label: "亜種 D. h. becerrae ベセラエ亜種",
                            level: 6,
                            candidateId: "tax-dhb",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: "allo-genus",
                    label: "属 Allomyrina",
                    level: 4,
                    children: [
                      {
                        id: "ad-species",
                        label: "種 Allomyrina dichotoma カブトムシ（大）",
                        level: 5,
                        candidateId: "tax-ad",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "fish",
        label: "魚類 Actinopterygii",
        level: 1,
        children: [
          {
            id: "cypriniformes",
            label: "目 Cypriniformes コイ目",
            level: 2,
            children: [
              {
                id: "cyprinidae",
                label: "科 Cyprinidae コイ科",
                level: 3,
                children: [
                  {
                    id: "goldfish",
                    label: "種 Carassius auratus 金魚",
                    level: 4,
                    candidateId: "tax-goldfish",
                  },
                  {
                    id: "koi",
                    label: "種 Cyprinus carpio コイ",
                    level: 4,
                    candidateId: "tax-koi",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "artifact",
    label: "器物・無機物 artifact",
    level: 0,
    children: [
      {
        id: "container",
        label: "容器カテゴリ",
        level: 1,
        children: [
          {
            id: "plate",
            label: "皿 plate",
            level: 2,
            candidateId: "tax-plate",
          },
        ],
      },
    ],
  },
];

/** 質問で絞る — Akinator 式決定木（tag intersect · CAL-05-CTX-03） */
export const QA_RANKS = ["order", "family", "genus"] as const;
export type QaRank = (typeof QA_RANKS)[number];

export type QaAnswerRecord = { question: string; answer: string };

export type QaEngineState = {
  candidateIds: string[];
  history: QaAnswerRecord[];
  rankIndex: number;
};

export type QaStepView = {
  question: string;
  options: { label: string; value: string }[];
  remaining: number;
  done: boolean;
  resultCandidates: ObsTaxonCandidate[];
};

const RANK_OPTION_LABELS: Record<string, string> = {
  "order:Coleoptera": "鞘翅目（甲虫目）",
  "order:Cypriniformes": "コイ目（Cypriniformes）",
  "family:Scarabaeidae": "コガネムシ科",
  "family:Cyprinidae": "コイ科",
  "genus:Dynastes": "Dynastes 属（ヘラクレスオオカブト属）",
  "genus:Allomyrina": "Allomyrina 属（カブトムシ属）",
};

function tagValue(candidate: ObsTaxonCandidate, rank: string): string | null {
  const prefix = `${rank}:`;
  return candidate.tags.find((t) => t.startsWith(prefix)) ?? null;
}

function candidatesFromIds(ids: string[]): ObsTaxonCandidate[] {
  return ids.map((id) => findCandidate(id)).filter((c): c is ObsTaxonCandidate => Boolean(c));
}

export function initQaEngine(domain: ObsDomain): QaEngineState {
  const ids = TAXON_CANDIDATES.filter((c) => c.domain === domain).map((c) => c.id);
  return { candidateIds: ids, history: [], rankIndex: 0 };
}

function formatRankOption(tag: string, sample: ObsTaxonCandidate): string {
  if (RANK_OPTION_LABELS[tag]) return RANK_OPTION_LABELS[tag]!;
  const parts = tag.split(":");
  const val = parts[1] ?? tag;
  if (tag.startsWith("order:")) return `目: ${val}`;
  if (tag.startsWith("family:")) return `科: ${val}`;
  if (tag.startsWith("genus:")) return `属: ${val}`;
  return sample.displayJa;
}

export function getQaStep(state: QaEngineState): QaStepView {
  const candidates = candidatesFromIds(state.candidateIds);
  const remaining = candidates.length;

  if (remaining === 0) {
    return {
      question: "候補が見つかりませんでした。別のドメインか絞り込み方法をお試しください。",
      options: [],
      remaining: 0,
      done: true,
      resultCandidates: [],
    };
  }

  if (remaining === 1) {
    return {
      question: "候補が 1 件に絞り込まれました。登録リストに追加できます。",
      options: [],
      remaining: 1,
      done: true,
      resultCandidates: candidates,
    };
  }

  for (let ri = state.rankIndex; ri < QA_RANKS.length; ri++) {
    const rank = QA_RANKS[ri]!;
    const buckets = new Map<string, ObsTaxonCandidate[]>();
    for (const c of candidates) {
      const v = tagValue(c, rank) ?? `__unknown_${rank}`;
      const list = buckets.get(v) ?? [];
      list.push(c);
      buckets.set(v, list);
    }
    if (buckets.size <= 1) continue;

    const dominant = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length)[0]!;
    const [tag, bucket] = dominant;
    const label = formatRankOption(tag, bucket[0]!);
    return {
      question: `「${label}」に当てはまりますか？`,
      options: [
        { label: "はい", value: tag },
        { label: "いいえ", value: `__not_${tag}` },
        { label: "わからない", value: "__skip__" },
      ],
      remaining,
      done: false,
      resultCandidates: [],
    };
  }

  return {
    question: "どの種・亜種に最も近いですか？",
    options: candidates.map((c) => ({ label: c.displayJa, value: c.id })),
    remaining,
    done: false,
    resultCandidates: [],
  };
}

export function applyQaAnswer(
  state: QaEngineState,
  value: string,
  question: string,
  answerLabel: string,
): QaEngineState {
  const history = [...state.history, { question, answer: answerLabel }];

  if (value === "__skip__") {
    return { ...state, history, rankIndex: state.rankIndex + 1 };
  }

  if (value.startsWith("tax-")) {
    return { candidateIds: [value], history, rankIndex: state.rankIndex };
  }

  if (value.startsWith("__not_")) {
    const tag = value.slice("__not_".length);
    const rank = tag.split(":")[0] as QaRank;
    const filtered = state.candidateIds.filter((id) => {
      const c = findCandidate(id);
      return c && tagValue(c, rank) !== tag;
    });
    return {
      candidateIds: filtered.length > 0 ? filtered : state.candidateIds,
      history,
      rankIndex: state.rankIndex + 1,
    };
  }

  const rank = value.split(":")[0] as QaRank;
  const filtered = state.candidateIds.filter((id) => {
    const c = findCandidate(id);
    return c && tagValue(c, rank) === value;
  });

  return {
    candidateIds: filtered.length > 0 ? filtered : state.candidateIds,
    history,
    rankIndex: state.rankIndex + 1,
  };
}

const DOMAIN_LABELS: Record<ObsDomain, string> = {
  biological: "生物",
  artifact: "器物・無機物",
  digital: "デジタル",
  environment: "環境",
  custom: "カスタム",
};

export const DOMAIN_CHIPS = [
  { key: "biological" as const, label: "生物" },
  { key: "artifact" as const, label: "器物・無機物" },
  { key: "digital" as const, label: "デジタル" },
  { key: "environment" as const, label: "環境" },
  { key: "custom" as const, label: "カスタム" },
];

export function domainLabel(domain: ObsDomain): string {
  return DOMAIN_LABELS[domain] ?? domain;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function defaultSubscriptions(): ObsSubscription[] {
  const now = new Date().toISOString();
  return [
    candidateToSubscription(TAXON_CANDIDATES[0]!, now),
    candidateToSubscription(TAXON_CANDIDATES[3]!, now),
  ];
}

export function candidateToSubscription(candidate: ObsTaxonCandidate, addedAt?: string): ObsSubscription {
  return {
    ...candidate,
    subscriptionId: `sub-${candidate.id}-${Date.now()}`,
    addedAt: addedAt ?? new Date().toISOString(),
  };
}

export function readSubscriptions(): ObsSubscription[] {
  if (typeof localStorage === "undefined") return defaultSubscriptions();
  const stored = safeParse<ObsSubscription[]>(localStorage.getItem(OBS_SUBSCRIPTIONS_KEY));
  if (!stored || stored.length === 0) {
    const seeded = defaultSubscriptions();
    writeSubscriptions(seeded);
    return seeded;
  }
  return stored;
}

export function writeSubscriptions(subs: ObsSubscription[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(OBS_SUBSCRIPTIONS_KEY, JSON.stringify(subs));
}

export function addSubscription(candidate: ObsTaxonCandidate): ObsSubscription {
  const subs = readSubscriptions();
  const exists = subs.some(
    (s) => s.id === candidate.id && s.level === candidate.level && s.subspeciesStatus === candidate.subspeciesStatus,
  );
  if (exists) {
    return subs.find(
      (s) => s.id === candidate.id && s.level === candidate.level,
    )!;
  }
  const next = candidateToSubscription(candidate);
  writeSubscriptions([...subs, next]);
  return next;
}

export function removeSubscription(subscriptionId: string): void {
  const subs = readSubscriptions().filter((s) => s.subscriptionId !== subscriptionId);
  writeSubscriptions(subs);
  const last = readLastTargetId();
  if (last === subscriptionId) {
    writeLastTargetId(subs[0]?.subscriptionId ?? null);
  }
}

export function readLastTargetId(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(OBS_LAST_TARGET_KEY);
}

export function writeLastTargetId(id: string | null): void {
  if (typeof localStorage === "undefined") return;
  if (!id) {
    localStorage.removeItem(OBS_LAST_TARGET_KEY);
    return;
  }
  localStorage.setItem(OBS_LAST_TARGET_KEY, id);
}

export function resolveActiveSubscription(subscriptionId?: string | null): ObsSubscription | null {
  const subs = readSubscriptions();
  if (subs.length === 0) return null;
  const id = subscriptionId ?? readLastTargetId();
  if (id) {
    const found = subs.find((s) => s.subscriptionId === id);
    if (found) return found;
  }
  return subs[0] ?? null;
}

export function searchTaxonCandidates(query: string, domain?: ObsDomain): ObsTaxonCandidate[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return TAXON_CANDIDATES.filter((c) => {
    if (domain && c.domain !== domain) return false;
    const hay = [c.displayJa, c.scientificName, c.speciesName, ...c.searchTerms].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

export function findCandidate(id: string): ObsTaxonCandidate | undefined {
  return TAXON_CANDIDATES.find((c) => c.id === id);
}

export function subscriptionToWorkflowContext(
  sub: ObsSubscription,
  stage: ObsWorkflowContext["stage"] = "larva",
): ObsWorkflowContext {
  return {
    domain: sub.domain,
    displayJa: sub.displayJa,
    scientificName: sub.scientificName,
    speciesName: sub.speciesName,
    stage,
    subspeciesStatus: sub.subspeciesStatus,
    subscriptionId: sub.subscriptionId,
    tags: [...sub.tags],
    templateDomain: sub.domain,
  };
}

/** domain 別タグ facet プレビュー（G6 — 昆虫 vs 魚で辞書が異なる） */
export function tagFacetHint(domain: ObsDomain): string {
  switch (domain) {
    case "biological":
      return "昆虫: order/family/genus · 魚: class/family/species — ドメインで facet が切り替わります";
    case "artifact":
      return "器物: category/item — 昆虫タグとは別辞書";
    case "digital":
      return "デジタル: platform/genre/work";
    case "environment":
      return "環境: place/zone（Phase 3 接続予定）";
    default:
      return "カスタム: custom:* 自由タグ";
  }
}

export function flattenTree(nodes: TreeNode[], depth = 0): { node: TreeNode; depth: number }[] {
  const out: { node: TreeNode; depth: number }[] = [];
  for (const node of nodes) {
    out.push({ node, depth });
    if (node.children) {
      out.push(...flattenTree(node.children, depth + 1));
    }
  }
  return out;
}

export type TreeBreadcrumb = { id: string; label: string };

/** ノード id からルートまでのパンくず（GBIF パターン） */
export function breadcrumbForNode(nodes: TreeNode[], targetId: string): TreeBreadcrumb[] {
  const path: TreeBreadcrumb[] = [];
  function walk(list: TreeNode[], trail: TreeBreadcrumb[]): boolean {
    for (const node of list) {
      const next = [...trail, { id: node.id, label: node.label }];
      if (node.id === targetId) {
        path.push(...next);
        return true;
      }
      if (node.children && walk(node.children, next)) return true;
    }
    return false;
  }
  walk(nodes, []);
  return path;
}

function nodeMatchesQuery(node: TreeNode, q: string): boolean {
  return node.label.toLowerCase().includes(q);
}

function filterTreeRecursive(nodes: TreeNode[], q: string): TreeNode[] {
  const out: TreeNode[] = [];
  for (const node of nodes) {
    const childFiltered = node.children ? filterTreeRecursive(node.children, q) : [];
    const selfMatch = nodeMatchesQuery(node, q);
    if (selfMatch || childFiltered.length > 0) {
      out.push({
        ...node,
        children: childFiltered.length > 0 ? childFiltered : node.children,
      });
    }
  }
  return out;
}

/** ツリー内検索 — マッチ枝のみ残す（iNaturalist パターン） */
export function filterTreeNodes(nodes: TreeNode[], query: string): TreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;
  return filterTreeRecursive(nodes, q);
}

/** 検索時に展開すべき祖先ノード id */
export function expandIdsForQuery(nodes: TreeNode[], query: string): Set<string> {
  const q = query.trim().toLowerCase();
  const ids = new Set<string>();
  if (!q) return ids;

  function walk(list: TreeNode[], ancestors: string[]): boolean {
    let branchMatch = false;
    for (const node of list) {
      const selfMatch = nodeMatchesQuery(node, q);
      const childMatch = node.children ? walk(node.children, [...ancestors, node.id]) : false;
      if (selfMatch || childMatch) {
        ancestors.forEach((a) => ids.add(a));
        ids.add(node.id);
        branchMatch = true;
      }
    }
    return branchMatch;
  }
  walk(nodes, []);
  return ids;
}

/** ランク略称（パンくず用） */
export const TREE_RANK_HINT: Record<number, string> = {
  0: "域",
  1: "綱",
  2: "目",
  3: "科",
  4: "属",
  5: "種",
  6: "亜種",
};

/** ドメインチップに応じたツリー枝（lab mock） */
export function treeNodesForDomain(domain: ObsDomain): TreeNode[] {
  if (domain === "artifact") {
    return TAXON_TREE.filter((n) => n.id === "artifact");
  }
  if (domain === "biological") {
    return TAXON_TREE.filter((n) => n.id === "bio");
  }
  return [];
}
