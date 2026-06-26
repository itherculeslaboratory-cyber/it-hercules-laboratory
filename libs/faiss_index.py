"""DEPRECATED shim — import from libs.ihl.observation.faiss_index instead."""

import sys

import libs.ihl.observation.faiss_index as _mod

sys.modules[__name__] = _mod
