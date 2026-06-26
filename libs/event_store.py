"""DEPRECATED shim — import from libs.ihl.core.event_store instead."""

import sys

import libs.ihl.core.event_store as _mod

sys.modules[__name__] = _mod
