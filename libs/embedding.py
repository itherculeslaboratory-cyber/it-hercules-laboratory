"""DEPRECATED shim — import from libs.ihl.observation.embedding instead."""

import sys

import libs.ihl.observation.embedding as _mod

sys.modules[__name__] = _mod
