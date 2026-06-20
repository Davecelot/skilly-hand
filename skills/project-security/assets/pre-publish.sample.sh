#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if [ -f "$script_dir/generic-ci-security-gate.sh" ]; then
  sh "$script_dir/generic-ci-security-gate.sh"
  exit 0
fi

echo "[project-security] generic publish gate script is missing: $script_dir/generic-ci-security-gate.sh" >&2
exit 1
