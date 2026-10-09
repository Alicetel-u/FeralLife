"""Compatibility entry point: normalize reviewed RGBA PNGs with the Node tool.
The old white-threshold extraction erased foreground highlights; it is no longer used.
Set FERAL_ASSET_MODULE_ROOT to a directory containing sharp when needed.
"""
from pathlib import Path
import subprocess
import sys

if __name__ == '__main__':
    root = Path(__file__).resolve().parent.parent
    sys.exit(subprocess.call(['node', str(root / 'tools/prepare-cat.mjs')], cwd=root))
