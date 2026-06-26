"""DEPRECATED shim — import from libs.ihl.observation.solid_commit instead."""

import sys

import libs.ihl.observation.solid_commit as _mod

sys.modules[__name__] = _mod
