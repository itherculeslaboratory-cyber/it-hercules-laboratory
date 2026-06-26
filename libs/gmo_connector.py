"""DEPRECATED shim — import from libs.ihl.payments.gmo_connector instead."""

import sys

import libs.ihl.payments.gmo_connector as _mod

sys.modules[__name__] = _mod
