"""DEPRECATED shim — import from libs.ihl.identity.auth_session instead."""

import sys

import libs.ihl.identity.auth_session as _mod

sys.modules[__name__] = _mod
