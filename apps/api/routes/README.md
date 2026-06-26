# apps/api/routes/

Thin FastAPI routers — domain logic stays in `libs/ihl/<domain>/`.

| Route file | Feature # | Prefix |
|------------|-----------|--------|
| `auth.py` | 01 | `/api/v1/auth/*` |
| `onboarding.py` | 03 | `/api/v1/onboarding/*` |
| `observation.py` | 05 | `/api/v1/observation/*` |
| `observation_solid.py` | 05 | `/api/captures` · `/api/measurements` |
| `market.py` | 06 | `/api/v1/market/*` |
| `board.py` | 07, 19 | `/api/v1/board/*` · `/api/v1/component-board` |
| `env.py` | 13 | `/api/v1/env/*` |
| `devices.py` | 13 | `/api/v1/devices/*` |
| `gmo.py` | 23 | `/api/v1/gmo/*` |
| `i18n.py` | 21 | `/api/v1/i18n/*` |
| `me.py` | 12 | `/api/v1/me/*` |
| `research.py` | 09 | `/api/v1/research/*` |

Remaining inline routes in `main.py` (Phase 2 peel backlog): match, economy, dispute, legal, home, builder, photo-analysis, cross, votes.
