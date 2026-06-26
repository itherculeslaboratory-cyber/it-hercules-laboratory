"""DEPRECATED shim — import from libs.ihl.payments.gmo_reconciliation_store instead."""

import sys

import libs.ihl.payments.gmo_reconciliation_store as _mod

sys.modules[__name__] = _mod
