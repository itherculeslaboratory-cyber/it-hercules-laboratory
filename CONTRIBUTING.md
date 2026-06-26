# Contributing to IT Hercules Laboratory

> **Outline v1** — 詳細設計・要件の正本は `指示/it-hercules-laboratory/`（civilization-os リポジトリ内）を参照。  
> **OSS スコープ**: [ADR-H-21](02-設計/_横断/adr/ADR-H-21-OSS公開スコープ-全機能IHL正本-v1.md)

---

## Quick start

```bash
git clone https://github.com/itherculeslaboratory-cyber/it-hercules-laboratory.git
cd 指示/it-hercules-laboratory
pip install -e ".[dev]"
pytest
```

Full 30-minute path: [`指示/it-hercules-laboratory/docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md`](docs/OSS-CONTRIBUTOR-ONBOARDING-v1.md)

---

## Philosophy

- **One feature, one component** — fix a single feature without learning the whole monolith
- **Improvement is part of the system** — OSS contributors are first-class maintainers
- **civilization-os is reference only** — never a runtime dependency for this repo
- **INSERT ONLY persistence** — R2 / event_store; no UPDATE/DELETE on truth records

---

## Where to read design (before coding)

| Topic | Path |
|-------|------|
| Requirements (01–23) | `指示/it-hercules-laboratory/01-要件/` |
| UI design | `指示/it-hercules-laboratory/02-設計/_ui-global/` |
| Component breakdown | `指示/it-hercules-laboratory/02-設計/_横断/component/` |
| ADRs & completion queue | `指示/it-hercules-laboratory/02-設計/_横断/adr/` · `05-運用/queues/` |
| OSS gap table | `指示/it-hercules-laboratory/02-設計/_横断/00-OSS機能ギャップ表-v1.md` |

---

## Repo layout

```
apps/api/routes/   Thin FastAPI routers per feature
apps/web/          Next.js UI (features/ scaffold)
components/        C-USB manifest pipelines (run.py)
libs/ihl/<domain>/ Domain logic (shims at libs/*.py)
tests/             unit · contract · integration
schemas/           YAML contracts (append-only events)
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for layer diagram.

---

## Pull request checklist (per feature)

- [ ] Maps to a `POST-OSS-NN` queue item or documented gap row
- [ ] Unit test(s) pass; no new `mock_store` usage for production paths
- [ ] API matches detailed design in `指示/…/詳細設計`
- [ ] UI route reachable per transition design (if applicable)
- [ ] Component or lib `README.md` updated
- [ ] No secrets in code, logs, or PR description

---

## Tests

```bash
pytest                    # all tests
pytest tests/unit/        # fast feedback
```

CI runs without live API keys (stub/stg modes). Live GMO / SwitchBot keys are human-gated — see completion queue `HUMAN-*` items.

---

## License

See [LICENSE](./LICENSE) (pointer to org policy — confirm before first public release).

---

## Code of conduct

Be precise, cite design docs in PRs, and keep keyboard-first UX testable.  
Completion bar: [`00-完成定義と実行キュー-v1.md`](05-運用/queues/00-完成定義と実行キュー-v1.md) §0 USER-DONE.

---

*Outline v1 · 2026-06-10*
