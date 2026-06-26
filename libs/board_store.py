"""DEPRECATED shim — import from libs.ihl.governance.board_store instead."""

import sys

import libs.ihl.governance.board_store as _mod

sys.modules[__name__] = _mod
