# W2 Screen Worker Prompt Template

> Copy this block when dispatching a parallel worker for one walkthrough screen.

---

## Task

Implement O2 hand UI overrides for **one** W2 walkthrough screen.

| Field | Value |
|-------|-------|
| walkId | `{walkId}` |
| title | `{title}` |
| mockBase | `{mockBase}` |
| componentPrefix | `{componentPrefix}` |
| overrideFile | `packages/ihl-ui-catalog/src/registry/overrides/{componentPrefix}.ts` |
| mock PNG | `apps/ui-parts-lab/public/mockups/{mockBase}.png` |

## Hard rules

1. Edit **only** your `overrideFile` (+ new component files under `components/features/` if needed).
2. Do **not** touch `primitives.ts`, `overrides.generated.ts`, `overrides.ts`, or other screens' override files.
3. Export `SCREEN_OVERRIDES: Record<string, CatalogComponent>` — keys must match component ids in `catalog/ui-components.yaml`.
4. Run before finishing:
   ```bash
   node scripts/w2-merge-overrides.mjs
   cd apps/ui-parts-lab && npm run build
   ```
5. If merge reports **COLLISION**, you edited a key owned by another file — fix before commit.

## Import pattern

```typescript
import type { CatalogComponent } from "../overrides.types";
// import your hand components from ../../components/...
```

## Standard 3-part layout

Most screens use ContentArea + PrimaryAction + StatePanel:

```typescript
export const SCREEN_OVERRIDES: Record<string, CatalogComponent> = {
  "{componentPrefix}__ContentArea": ...,
  "{componentPrefix}__PrimaryAction": ...,
  "{componentPrefix}__StatePanel": ...,
};
```

## Single-panel layout

Home / lineage / paper screens use one MainPanel key (see existing `ihl-01-nav-home.ts`).

## Reference

- Ownership: `packages/ihl-ui-catalog/src/registry/overrides/README.md`
- Manifest: `scripts/w2-screen-worker-manifest.json`
- Walkthrough hotspots: `02-設計/_ui-global/ux-walkthrough/walkthrough.js` → `{walkId}`

## Done criteria

- [ ] `SCREEN_OVERRIDES` covers all hand regions for this mock
- [ ] `w2-merge-overrides.mjs` passes (no collisions)
- [ ] `npm run build` in `apps/ui-parts-lab` passes
- [ ] Update manifest status for `{walkId}` → `"done"` in `scripts/w2-screen-worker-manifest.json`

---

*Replace `{walkId}`, `{title}`, `{mockBase}`, `{componentPrefix}` from manifest entry before dispatch.*
