"""DEPRECATED shim — import from libs.ihl.observation.image instead."""

import sys

import libs.ihl.observation.image as _mod

sys.modules[__name__] = _mod
