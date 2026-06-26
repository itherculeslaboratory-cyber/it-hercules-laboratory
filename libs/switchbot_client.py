"""DEPRECATED shim — import from libs.ihl.env.switchbot_client instead."""

import sys

import libs.ihl.env.switchbot_client as _mod

sys.modules[__name__] = _mod
