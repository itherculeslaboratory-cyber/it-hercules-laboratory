# apps/web/src/features/ (scaffold)

Feature-colocated modules per OSS-REPO-LAYOUT **P4**. Pages remain under `src/app/` until Phase 2+ peel.

| # | Feature | Current routes (`src/app/`) | Target feature dir |
|---|---------|----------------------------|-------------------|
| 01 | Login | `login/` | `01-login/` |
| 02 | Terms | `terms/` | `02-terms/` |
| 03 | Register | `register/` | `03-register/` |
| 04 | Home | `page.tsx` | `04-home/` |
| 05 | Observation | `observation/**` | `05-observation/` |
| 06 | Market | `market/**` | `06-market/` |
| 07 | Board | `board/**` | `07-board/` |
| 08 | Economy | `economy/shop/` | `08-economy/` |
| 09 | Research | *(API only)* | `09-research/` |
| 10 | Match | `match/` | `10-match/` |
| 11 | Dispute | `board/[category]/dispute/` | `11-dispute/` |
| 12 | Settings | `settings/**` | `12-settings/` |
| 13 | Env IoT | `env/shelf/` | `13-env/` |
| 14 | Contribution | `contribution/` | `14-contribution/` |
| 16 | UI Builder | `builder/` | `16-builder/` |
| 18 | Photo analysis | `component/photo-analysis/` | `18-photo-analysis/` |
| 19 | Component board | `board/component/` | `19-component-board/` |
| 20 | Vote | `vote/` | `20-vote/` |
| 23 | GMO admin | `admin/gmo/` | `23-gmo/` |

Shared UI: `src/components/` · hooks: `src/hooks/` · API client: `src/lib/api.ts`
