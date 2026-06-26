"""DEPRECATED shim — import from libs.ihl.governance.pii instead."""

import sys

import libs.ihl.governance.pii as _mod

sys.modules[__name__] = _mod
