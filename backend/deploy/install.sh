#!/usr/bin/env bash
set -euo pipefail
archive=${1:?Supply backend archive path}
root=/opt/terrasync
release="$root/releases/$(date -u +%Y%m%d%H%M%S)-$$"
previous=$(readlink -f "$root/current" 2>/dev/null || true)
sudo mkdir -p "$root/releases" "$root/data"
sudo chown ubuntu:ubuntu "$root" "$root/releases" "$root/data"
mkdir -p "$release"
tar -xzf "$archive" -C "$release"
python3 -m venv "$release/.venv"
"$release/.venv/bin/pip" install -r "$release/requirements.txt"
sudo tee /etc/systemd/system/terrasync-api.service >/dev/null <<'UNIT'
[Unit]
Description=TerraSync API
After=network.target
[Service]
User=ubuntu
WorkingDirectory=/opt/terrasync/current
Environment=TERRASYNC_DATABASE_PATH=/opt/terrasync/data/terrasync.db
ExecStart=/opt/terrasync/current/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=on-failure
[Install]
WantedBy=multi-user.target
UNIT
ln -sfn "$release" "$root/current-next"
mv -Tf "$root/current-next" "$root/current"
sudo systemctl daemon-reload
sudo systemctl enable terrasync-api >/dev/null
sudo systemctl restart terrasync-api
if ! curl --fail --silent --retry 10 --retry-delay 1 --retry-connrefused http://127.0.0.1:8000/health >/dev/null; then
  if [ -n "$previous" ] && [ -d "$previous" ]; then
    ln -sfn "$previous" "$root/current-next"
    mv -Tf "$root/current-next" "$root/current"
    sudo systemctl restart terrasync-api
  fi
  exit 1
fi
printf 'TerraSync API healthy at %s\n' "$release"
