"""DEPRECATED shim — import from libs.ihl.env.device_registry instead."""

import sys

import libs.ihl.env.device_registry as _mod

sys.modules[__name__] = _mod
