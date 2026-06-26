"""DEPRECATED shim — import from libs.ihl.i18n.i18n_catalog instead."""

import sys

import libs.ihl.i18n.i18n_catalog as _mod

sys.modules[__name__] = _mod
