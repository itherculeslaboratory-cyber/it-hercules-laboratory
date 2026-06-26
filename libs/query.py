"""DEPRECATED shim — import from libs.ihl.observation.query instead."""

import sys

import libs.ihl.observation.query as _mod

sys.modules[__name__] = _mod
