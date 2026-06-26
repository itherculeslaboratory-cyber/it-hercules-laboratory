"""DEPRECATED shim — import from libs.ihl.economy.economy_logic instead."""

import sys

import libs.ihl.economy.economy_logic as _mod

sys.modules[__name__] = _mod
