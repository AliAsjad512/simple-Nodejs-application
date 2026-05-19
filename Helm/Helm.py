import subprocess
import argparse
import json
import sys
from pathlib import Path
class HelmReleaseManager:
    def __init__(self, namespace=None):
        self.namespace = namespace
