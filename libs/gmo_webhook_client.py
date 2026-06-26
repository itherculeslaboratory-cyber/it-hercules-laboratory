"""DEPRECATED shim — import from libs.ihl.payments.gmo_webhook_client instead."""

import sys

import libs.ihl.payments.gmo_webhook_client as _mod

sys.modules[__name__] = _mod
