"""DEPRECATED shim — import from libs.ihl.core.domain_catalog instead."""

import sys

import libs.ihl.core.domain_catalog as _mod

sys.modules[__name__] = _mod
