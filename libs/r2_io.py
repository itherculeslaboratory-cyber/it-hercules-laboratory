"""DEPRECATED shim — import from libs.ihl.core.r2_io instead."""

import sys

import libs.ihl.core.r2_io as _mod

sys.modules[__name__] = _mod
