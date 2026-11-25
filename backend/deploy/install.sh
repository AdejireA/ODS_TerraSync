#!/usr/bin/env bash
# Installs a backend release on the Nobus VM: API (always) and voice worker
# (when /opt/terrasync/data/voice.env exists). Rolls the API back on failure.
set -euo pipefail
archive=${1:?Supply backend archive path}
root=/opt/terrasync
release="$root/releases/$(date -u +%Y%m%d%H%M%S)-$$"
previous=$(readlink -f "$root/current" 2>/dev/null || true)
voice_env="$root/data/voice.env"
sudo mkdir -p "$root/releases" "$root/data"
sudo chown ubuntu:ubuntu "$root" "$root/releases" "$root/data"
mkdir -p "$release"
tar -xzf "$archive" -C "$release"
python3 -m venv "$release/.venv"
"$release/.venv/bin/pip" install -r "$release/requirements.txt"
if [ ! -f "$root/data/api.env" ]; then
    umask 077
    printf 'TERRASYNC_SECRET_KEY=%s\n' "$(python3 -c 'import secrets; print(secrets.token_urlsafe(48))')" > "$root/data/api.env"
fi

# Voice worker needs Python 3.10+ and LiveKit/Spitch credentials in voice.env.
voice_enabled=false
if [ -f "$voice_env" ]; then
    if python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)'; then
        "$release/.venv/bin/pip" install -r "$release/requirements-voice.txt"
        (cd "$release" && "$release/.venv/bin/python" -m voice.agent download-files)
        voice_enabled=true
    else
        echo "WARNING: python3 is older than 3.10; skipping the voice worker." >&2
    fi
else
    echo "NOTE: $voice_env not found; voice worker not installed (API deploy continues)." >&2
fi

sudo tee /etc/systemd/system/terrasync-api.service >/dev/null <<'UNIT'
[Unit]
Description=TerraSync API
After=network.target
[Service]
User=ubuntu
WorkingDirectory=/opt/terrasync/current
Environment=TERRASYNC_DATABASE_PATH=/opt/terrasync/data/terrasync.db
EnvironmentFile=/opt/terrasync/data/api.env
# Optional: LiveKit credentials so the API can issue browser call tokens.
EnvironmentFile=-/opt/terrasync/data/voice.env
# --proxy-headers: behind nginx, use X-Forwarded-For as the client address (rate limits are per visitor).
ExecStart=/opt/terrasync/current/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --proxy-headers --forwarded-allow-ips 127.0.0.1
Restart=on-failure
[Install]
WantedBy=multi-user.target
UNIT

sudo tee /etc/systemd/system/terrasync-voice.service >/dev/null <<'UNIT'
[Unit]
Description=TerraSync voice worker (LiveKit + Spitch)
After=network-online.target terrasync-api.service
Wants=network-online.target
[Service]
User=ubuntu
WorkingDirectory=/opt/terrasync/current
Environment=TERRASYNC_DATABASE_PATH=/opt/terrasync/data/terrasync.db
EnvironmentFile=/opt/terrasync/data/voice.env
ExecStart=/opt/terrasync/current/.venv/bin/python -m voice.agent start
Restart=always
RestartSec=5
[Install]
WantedBy=multi-user.target
UNIT

ln -sfn "$release" "$root/current-next"
mv -Tf "$root/current-next" "$root/current"
sudo systemctl daemon-reload
sudo systemctl enable terrasync-api >/dev/null
if ! sudo systemctl restart terrasync-api || ! curl --fail --silent --retry 10 --retry-delay 1 --retry-connrefused http://127.0.0.1:8000/health >/dev/null; then
  if [ -n "$previous" ] && [ -d "$previous" ]; then
    ln -sfn "$previous" "$root/current-next"
    mv -Tf "$root/current-next" "$root/current"
    sudo systemctl restart terrasync-api
  fi
  exit 1
fi
printf 'TerraSync API healthy at %s\n' "$release"

if [ "$voice_enabled" = true ]; then
    sudo systemctl enable terrasync-voice >/dev/null
    sudo systemctl restart terrasync-voice
    # Wait for the worker to register with LiveKit; report but do not fail the API deploy.
    for _ in $(seq 1 30); do
        if sudo journalctl -u terrasync-voice --since "-2 min" --no-pager 2>/dev/null | grep -q "registered worker"; then
            echo "TerraSync voice worker registered with LiveKit"
            exit 0
        fi
        sleep 2
    done
    echo "WARNING: voice worker did not register within 60s. Recent logs:" >&2
    sudo journalctl -u terrasync-voice -n 30 --no-pager >&2 || true
else
    if systemctl is-active --quiet terrasync-voice; then sudo systemctl stop terrasync-voice; fi
fi
