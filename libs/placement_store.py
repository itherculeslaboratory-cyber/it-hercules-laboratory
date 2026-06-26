"""DEPRECATED shim — import from libs.ihl.env.placement_store instead."""

import sys

import libs.ihl.env.placement_store as _mod

sys.modules[__name__] = _mod
