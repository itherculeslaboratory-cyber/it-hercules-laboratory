"""DEPRECATED shim — import from libs.ihl.core.schema_validator instead."""

import sys

import libs.ihl.core.schema_validator as _mod

sys.modules[__name__] = _mod
