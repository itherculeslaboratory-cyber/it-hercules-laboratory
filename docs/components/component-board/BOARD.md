# Component Board

## [2026-06-10] GitHub SSOT scaffold
- Intent: #19 コンポーネント掲示板は GitHub BOARD / Discussions を正本にする
- Route: `/api/v1/component-board`
- Contract: `github_board_url`, `github_discussion_url`, `component_id`
- Note: Runtime events are stored in R2 append-only; this file tracks improvement context only.
