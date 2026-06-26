"""Component board read model backed by GitHub links.

Design intent (#19): component improvement history lives on GitHub
(BOARD.md / Discussions / PR), while runtime events remain in R2.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass
class GithubComponentBoard:
    docs_root: Path = Path("docs/components")
    repository: str = os.environ.get(
        "IHL_GITHUB_REPOSITORY", "itherculeslaboratory-cyber/it-hercules-laboratory"
    )
    default_branch: str = os.environ.get("IHL_GITHUB_DEFAULT_BRANCH", "main")

    def _board_path(self, component_id: str) -> Path:
        return self.docs_root / component_id / "BOARD.md"

    def _board_url(self, component_id: str) -> str:
        return (
            f"https://github.com/{self.repository}/blob/"
            f"{self.default_branch}/docs/components/{component_id}/BOARD.md"
        )

    def _discussion_url(self, component_id: str) -> str:
        # GitHub Discussions category/tag contract can evolve;
        # keep this as a stable deep-link hint for OSS contributors.
        return f"https://github.com/{self.repository}/discussions?discussions_q={component_id}"

    def list_items(self) -> list[dict[str, Any]]:
        if not self.docs_root.is_dir():
            return []
        items: list[dict[str, Any]] = []
        for board_path in sorted(self.docs_root.glob("*/BOARD.md")):
            component_id = board_path.parent.name
            items.append(self.get_item(component_id))
        return items

    def get_item(self, component_id: str) -> dict[str, Any]:
        board_path = self._board_path(component_id)
        exists = board_path.is_file()
        return {
            "component_id": component_id,
            "github_board_url": self._board_url(component_id),
            "github_discussion_url": self._discussion_url(component_id),
            "board_path": str(board_path).replace("\\", "/"),
            "board_exists": exists,
        }
