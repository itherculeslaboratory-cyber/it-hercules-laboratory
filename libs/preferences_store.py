"""DEPRECATED shim — import from libs.ihl.identity.preferences_store instead."""

import sys

import libs.ihl.identity.preferences_store as _mod

sys.modules[__name__] = _mod
