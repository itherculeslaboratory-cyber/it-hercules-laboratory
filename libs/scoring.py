"""DEPRECATED shim — import from libs.ihl.observation.scoring instead."""

import sys

import libs.ihl.observation.scoring as _mod

sys.modules[__name__] = _mod
