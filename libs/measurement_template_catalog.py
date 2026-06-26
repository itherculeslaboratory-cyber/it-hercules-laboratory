"""DEPRECATED shim — import from libs.ihl.observation.measurement_template_catalog instead."""

import sys

import libs.ihl.observation.measurement_template_catalog as _mod

sys.modules[__name__] = _mod
