"""DEPRECATED shim — import from libs.ihl.payments.gmo_transfer_code instead."""

import sys

import libs.ihl.payments.gmo_transfer_code as _mod

sys.modules[__name__] = _mod
