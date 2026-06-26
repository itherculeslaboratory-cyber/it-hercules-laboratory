"""DEPRECATED shim — import from libs.ihl.core.catalog instead."""

import sys

import libs.ihl.core.catalog as _mod

sys.modules[__name__] = _mod
