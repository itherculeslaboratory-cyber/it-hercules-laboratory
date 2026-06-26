"""DEPRECATED shim — import from libs.ihl.env.env_telemetry instead."""

import sys

import libs.ihl.env.env_telemetry as _mod

sys.modules[__name__] = _mod
