import subprocess
import argparse
import json
import sys
from pathlib import Path
class HelmReleaseManager:
    def __init__(self, namespace=None):
        self.namespace = namespace
    def run_cmd(self, cmd):
        full_cmd = ['helm'] + cmd
        if self.namespace:
            full_cmd.extend(['-n', self.namespace])
        result = subprocess.run(full_cmd, capture_output=True, text=True)
        return result.returncode, result.stdout, result.stderr
