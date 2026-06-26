"""DEPRECATED shim — import from libs.ihl.economy.market_state instead."""

import sys

import libs.ihl.economy.market_state as _mod

sys.modules[__name__] = _mod
