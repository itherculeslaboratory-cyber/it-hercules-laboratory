"""DEPRECATED shim — import from libs.ihl.env.collector_ingest instead."""

import sys

import libs.ihl.env.collector_ingest as _mod

sys.modules[__name__] = _mod
