#!/usr/bin/env node
/**
 * IHL contract oracle — FastAPI route extractor (shared).
 *
 * DET §3 の path 表と双方向で突き合わせるため、`apps/api/routes/*.py` から
 * method / path / handler / auth / status / errors を DET(erministic) に抽出する。
 * yaml/py パーサ非依存（regex のみ · Node 標準ライブラリのみ）。
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { IHL_ROOT } from './ihl-path-resolve.mjs';

/** feature id → route ファイル（repo root 相対）。#05 が黄金基準。 */
export const FEATURE_ROUTE_FILES = {
  '01': ['apps/api/routes/auth.py'],
  '03': ['apps/api/routes/onboarding.py', 'apps/api/routes/auth.py'],
  '04': ['apps/api/main.py'],
  '05': ['apps/api/routes/observation.py', 'apps/api/routes/observation_solid.py'],
  '06': ['apps/api/routes/market.py'],
  '07': ['apps/api/routes/board.py'],
  '12': ['apps/api/routes/me.py', 'apps/api/main.py'],
  '16': ['apps/api/main.py'],
  '17': ['apps/api/main.py', 'apps/api/routes/me.py'],
  '23': ['apps/api/routes/gmo.py'],
  '11': ['apps/api/main.py'],
};

/** feature id → path prefix filter（main.py 等の混在ファイル用 · 全 route に適用 — 単一ファイル feature 向け）。 */
export const FEATURE_ROUTE_PATH_PREFIX = {
  '04': '/api/v1/home',
};

/** feature id → source_file → prefix（混在 repo 内の main.py のみ絞る · me.py 等は無フィルタ）。 */
export const FEATURE_ROUTE_FILE_PREFIX = {
  '12': { 'apps/api/main.py': '/api/v1/settings' },
  '16': { 'apps/api/main.py': ['/api/v1/theme-packs', '/api/v1/builder'] },
  '11': { 'apps/api/main.py': '/api/v1/dispute' },
};

/** feature id → source_file → exact method:path（prefix より優先 · #17 等の共有 file 用）。 */
export const FEATURE_ROUTE_FILE_PATHS = {
  '17': {
    'apps/api/main.py': ['GET:/api/v1/settings'],
    'apps/api/routes/me.py': ['PATCH:/api/v1/me/preferences'],
  },
};

function matchesPrefix(path, prefix) {
  if (!prefix) return true;
  if (Array.isArray(prefix)) return prefix.some((p) => path.startsWith(p));
  return path.startsWith(prefix);
}

function matchesRouteFilter(route, filter) {
  if (!filter) return true;
  if (Array.isArray(filter)) {
    if (filter.some((f) => f.includes(':'))) {
      const key = `${route.method}:${route.path}`;
      return filter.includes(key);
    }
    return filter.some((p) => route.path.startsWith(p));
  }
  return route.path.startsWith(filter);
}

const DECORATOR_RE = /@(?:router|app)\.(get|post|put|patch|delete)\(\s*["']([^"']+)["']([^)]*)\)/gi;

/** path param `{capture_id}` 等を `{param}` へ正規化（表記ゆれ吸収）。 */
export function normalizePath(path) {
  return path.replace(/\{[^}]+\}/g, '{param}');
}

/** APIRouter(...) の router 全体 auth 依存を検出。 */
function hasGlobalAuth(text) {
  const m = text.match(/APIRouter\([\s\S]*?\)/);
  if (!m) return false;
  return /dependencies\s*=\s*\[[\s\S]*?(enforce_auth|RequiredWhenEnabledAuth)/.test(m[0]);
}

/** APIRouter(prefix="...") を抽出（auth.py 等の相対 path 用）。 */
function extractRouterPrefix(text) {
  const m = text.match(/router\s*=\s*APIRouter\s*\([\s\S]*?prefix\s*=\s*["']([^"']+)["']/);
  return m ? m[1] : '';
}

/** prefix + decorator path を結合（既に /api で始まる path はそのまま）。 */
export function joinRoutePath(prefix, path) {
  if (!prefix || path.startsWith('/api')) return path;
  const base = prefix.replace(/\/$/, '');
  const sub = path.startsWith('/') ? path : `/${path}`;
  return `${base}${sub}`;
}

/**
 * 1 つの python route ファイルから route を抽出。
 * @returns {Array<{method,path,path_normalized,handler,auth,success_status,errors:number[],source_file:string}>}
 */
export function extractRoutesFromFile(absPath, sourceLabel) {
  if (!existsSync(absPath)) return [];
  const text = readFileSync(absPath, 'utf8');
  const globalAuth = hasGlobalAuth(text);
  const routerPrefix = extractRouterPrefix(text);

  // 各デコレータの開始 index を集めてブロック境界を作る。
  const marks = [];
  let m;
  DECORATOR_RE.lastIndex = 0;
  while ((m = DECORATOR_RE.exec(text)) !== null) {
    marks.push({
      index: m.index,
      method: m[1].toUpperCase(),
      path: m[2],
      decoratorArgs: m[3] || '',
    });
  }

  const routes = [];
  for (let i = 0; i < marks.length; i += 1) {
    const start = marks[i].index;
    const end = i + 1 < marks.length ? marks[i + 1].index : text.length;
    const block = text.slice(start, end);

    const handlerMatch = block.match(/def\s+(\w+)\s*\(/);
    const handler = handlerMatch ? handlerMatch[1] : '';

    const routeAuth = /RequiredWhenEnabledAuth|Depends\(\s*enforce_auth/.test(block);
    const auth = globalAuth || routeAuth ? 'session' : 'public';

    const decStatus = marks[i].decoratorArgs.match(/status_code\s*=\s*(\d{3})/);
    const successStatus = decStatus ? Number(decStatus[1]) : marks[i].method === 'POST' ? 200 : 200;

    const errors = new Set();
    let em;
    const errRe = /status_code\s*=\s*(\d{3})/g;
    while ((em = errRe.exec(block)) !== null) {
      const code = Number(em[1]);
      if (code >= 400) errors.add(code);
    }
    // `status = 404 if ... else 400` 形の分岐も拾う。
    let bm;
    const branchRe = /status\s*=\s*(\d{3})[^\n]*else\s*(\d{3})/g;
    while ((bm = branchRe.exec(block)) !== null) {
      errors.add(Number(bm[1]));
      errors.add(Number(bm[2]));
    }
    if (auth === 'session') errors.add(401);

    const fullPath = joinRoutePath(routerPrefix, marks[i].path);
    routes.push({
      method: marks[i].method,
      path: fullPath,
      path_normalized: normalizePath(fullPath),
      handler,
      auth,
      success_status: successStatus,
      errors: [...errors].sort((a, b) => a - b),
      source_file: sourceLabel,
    });
  }
  return routes;
}

/** feature id の全 route ファイルを抽出（method+path で安定ソート）。 */
export function extractRoutesForFeature(featureId) {
  const files = FEATURE_ROUTE_FILES[featureId] ?? [];
  const routes = [];
  const filePrefixMap = FEATURE_ROUTE_FILE_PREFIX[featureId] ?? {};
  const filePathsMap = FEATURE_ROUTE_FILE_PATHS[featureId] ?? {};
  const globalPrefix = FEATURE_ROUTE_PATH_PREFIX[featureId];
  for (const rel of files) {
    const extracted = extractRoutesFromFile(join(IHL_ROOT, rel), rel);
    const exactFilter = filePathsMap[rel];
    const prefix = exactFilter ? undefined : (filePrefixMap[rel] ?? (files.length === 1 ? globalPrefix : undefined));
    if (exactFilter || prefix) {
      routes.push(...extracted.filter((r) => matchesRouteFilter(r, exactFilter ?? prefix)));
    } else {
      routes.push(...extracted);
    }
  }
  routes.sort((a, b) =>
    `${a.method} ${a.path}`.localeCompare(`${b.method} ${b.path}`),
  );
  return routes;
}

/**
 * DET §3.9（認証境界）の markdown path 表を抽出。
 * @returns {Array<{method,path,path_normalized}>}
 */
export function extractDocPathTable(detPath, { anchor = '認証境界' } = {}) {
  if (!detPath || !existsSync(detPath)) return [];
  const lines = readFileSync(detPath, 'utf8').split('\n');
  const anchorIdx = lines.findIndex((l) => l.includes(anchor));
  if (anchorIdx === -1) return [];
  const rows = [];
  for (let i = anchorIdx + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line.startsWith('##')) break; // 次セクションで終了
    if (!line.startsWith('|')) continue;
    if (line.includes('---')) continue;
    const cells = line.split('|').map((c) => c.trim());
    // cells[0] は先頭 '|' 由来の空文字
    const method = (cells[1] || '').toUpperCase();
    const rawPath = (cells[2] || '').replace(/`/g, '').trim();
    if (!/^(GET|POST|PUT|PATCH|DELETE)$/.test(method)) continue;
    if (!rawPath.startsWith('/api')) continue;
    rows.push({ method, path: rawPath, path_normalized: normalizePath(rawPath) });
  }
  return rows;
}
