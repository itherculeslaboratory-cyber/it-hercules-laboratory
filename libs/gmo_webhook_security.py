"""DEPRECATED shim — import from libs.ihl.payments.gmo_webhook_security instead."""

import sys

import libs.ihl.payments.gmo_webhook_security as _mod

sys.modules[__name__] = _mod
