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
   def list_releases(self, all_namespaces=False):
        if all_namespaces:
            cmd = ['list', '-a', '--all-namespaces', '-o', 'json']
        else:
            cmd = ['list', '-a', '-o', 'json']
        rc, out, err = self.run_cmd(cmd)
        if rc != 0:
            print(f"Error: {err}")
            return []
        releases = json.loads(out)
        return releases
    def release_history(self, release_name):
        cmd = ['history', release_name, '-o', 'json']
        rc, out, err = self.run_cmd(cmd)
        if rc != 0:
            print(f"Error: {err}")
            return []
        return json.loads(out)

     def rollback(self, release_name, revision):
        cmd = ['rollback', release_name, str(revision)]
        rc, out, err = self.run_cmd(cmd)
        if rc == 0:
            print(f"✅ Rolled back {release_name} to revision {revision}")
        else:
            print(f"❌ Rollback failed: {err}")
        return rc

    def get_values(self, release_name):
        cmd = ['get', 'values', release_name, '-o', 'json']
        rc, out, err = self.run_cmd(cmd)
        if rc == 0:
            return json.loads(out)
        return {}
    if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Helm Release Manager')
    parser.add_argument('--namespace', help='Kubernetes namespace')
    parser.add_argument('--action', choices=['list', 'history', 'rollback', 'values'], required=True)
    parser.add_argument('--release', help='Release name')
    parser.add_argument('--revision', type=int, help='Revision number for rollback')
    parser.add_argument('--all-namespaces', action='store_true')
    args = parser.parse_args()
     manager = HelmReleaseManager(args.namespace)
    if args.action == 'list':
        releases = manager.list_releases(args.all_namespaces)
        for rel in releases:
            print(f"{rel['name']}: {rel['status']} - {rel['namespace']}")
    elif args.action == 'history':
        history = manager.release_history(args.release)
        for rev in history:
            print(f"rev {rev['revision']}: {rev['status']} - {rev['updated']}")
    elif args.action == 'rollback':
        manager.rollback(args.release, args.revision)
    elif args.action == 'values':
        values = manager.get_values(args.release)
        print(json.dumps(values, indent=2))
