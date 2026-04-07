#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
# shellcheck source=/dev/null
. "$script_dir/run-security-check.shared.sh"

echo "[project-security] running commit gate..."
run_security_check
