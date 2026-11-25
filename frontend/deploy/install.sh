#!/usr/bin/env bash
# Publishes a frontend build on the Nobus VM.
#
# The VM's existing Caddy (/etc/caddy/Caddyfile, HTTPS via sslip.io) already
# serves /var/www/terrasync and proxies /api/* and /health to the API. This
# script does NOT change Caddy: it unpacks the build into a timestamped release
# and atomically points /var/www/terrasync at it. Rolls back if the new build
# is not what Caddy serves afterwards.
set -euo pipefail
archive=${1:?Supply frontend archive path}
root=/opt/terrasync/frontend
webroot=/var/www/terrasync
check_url=${TERRASYNC_FRONTEND_CHECK_URL:-http://127.0.0.1:8080}  # Caddy's local site block
release="$root/releases/$(date -u +%Y%m%d%H%M%S)-$$"

sudo mkdir -p "$root/releases" /var/www
sudo chown ubuntu:ubuntu "$root" "$root/releases"
mkdir -p "$release"
tar -xzf "$archive" -C "$release"
test -f "$release/index.html" || { echo "Build has no index.html" >&2; exit 1; }
# Caddy runs as its own user: make files readable and parent dirs traversable.
chmod -R a+rX "$release"
sudo chmod o+x /opt /opt/terrasync "$root" "$root/releases"

# Remember what was live so we can roll back.
previous=""
if [ -L "$webroot" ]; then
    previous=$(readlink -f "$webroot")
elif [ -d "$webroot" ]; then
    # First run: keep the hand-copied build as a backup and as the rollback target.
    previous="$webroot.bak-$(date -u +%Y%m%d%H%M%S)"
    sudo mv "$webroot" "$previous"
    echo "Moved existing $webroot to $previous"
fi

rollback() {
    echo "Rolling back $webroot" >&2
    if [ -n "$previous" ] && [ -d "$previous" ]; then
        sudo ln -sfn "$previous" "$webroot.next" && sudo mv -Tf "$webroot.next" "$webroot"
    fi
}

sudo ln -sfn "$release" "$webroot.next"
sudo mv -Tf "$webroot.next" "$webroot"

# An earlier deploy attempt installed nginx; make sure it never competes with Caddy.
if systemctl list-unit-files nginx.service >/dev/null 2>&1 && systemctl is-active --quiet caddy; then
    sudo systemctl disable --now nginx >/dev/null 2>&1 || true
fi

# Verify Caddy now serves this exact build (index.html references hashed assets).
asset=$(grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' "$release/index.html" | head -n1)
served=$(curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-all-errors "$check_url/" || true)
if [ -z "$served" ] || ! grep -q 'id="root"' <<<"$served" || { [ -n "$asset" ] && ! grep -qF "$asset" <<<"$served"; }; then
    echo "Smoke check failed: $check_url/ is not serving the new build ($asset)" >&2
    rollback
    exit 1
fi
if curl --fail --silent --retry 5 --retry-delay 1 -o /dev/null "$check_url/api/v1/locations"; then
    echo "API reachable through Caddy"
else
    echo "WARNING: site is up but $check_url/api/v1/locations did not respond" >&2
fi

# Keep the five most recent releases (never the live one).
live=$(readlink -f "$webroot")
ls -1dt "$root"/releases/* 2>/dev/null | tail -n +6 | while read -r old; do
    [ "$old" = "$live" ] || rm -rf "$old"
done
echo "TerraSync frontend live: $webroot -> $release"
