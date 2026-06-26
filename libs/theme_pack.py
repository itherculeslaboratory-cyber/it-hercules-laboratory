"""DEPRECATED shim — import from libs.ihl.theme.theme_pack instead."""

import sys

import libs.ihl.theme.theme_pack as _mod

sys.modules[__name__] = _mod
