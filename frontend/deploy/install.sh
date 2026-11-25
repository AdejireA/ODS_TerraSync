#!/usr/bin/env bash
# Installs a frontend build on the Nobus VM.
#   - Release files: /opt/terrasync/frontend/releases/<ts>, served from .../current
#   - Web server: Caddy if it already owns port 80 (the VM's existing setup),
#     otherwise nginx. Either way /api/* and /health go to the API on 127.0.0.1:8000.
#   - HTTPS: set TERRASYNC_DOMAIN (Caddy issues certificates automatically;
#     nginx uses certbot and also needs TERRASYNC_CERT_EMAIL).
# Rolls back the release and web-server config on any failure.
set -euo pipefail
archive=${1:?Supply frontend archive path}
domain=${TERRASYNC_DOMAIN:-}
email=${TERRASYNC_CERT_EMAIL:-}
root=/opt/terrasync/frontend
release="$root/releases/$(date -u +%Y%m%d%H%M%S)-$$"
MARKER="# managed by TerraSync frontend/deploy/install.sh"

port_owner() { sudo ss -ltnpH "( sport = :$1 )" 2>/dev/null | grep -oE '"[^"]+"' | head -n1 | tr -d '"' || true; }

server=nginx
for port in 80 443; do
    owner=$(port_owner "$port")
    case "$owner" in
        ""|nginx) ;;
        caddy) server=caddy ;;
        *)
            echo "ERROR: port $port is used by '$owner'; not taking it over." >&2
            sudo ss -ltnpH "( sport = :$port )" >&2 || true
            exit 1 ;;
    esac
done
echo "Web server: $server"

# ---------------------------------------------------------------- release
sudo mkdir -p "$root/releases"
sudo chown ubuntu:ubuntu "$root" "$root/releases"
mkdir -p "$release"
tar -xzf "$archive" -C "$release"
test -f "$release/index.html" || { echo "Build has no index.html" >&2; exit 1; }
chmod -R a+rX "$release"
sudo chmod o+x /opt/terrasync "$root" "$root/releases"
previous_release=$(readlink -f "$root/current" 2>/dev/null || true)

restore_release() {
    if [ -n "$previous_release" ] && [ -d "$previous_release" ]; then
        ln -sfn "$previous_release" "$root/current-next" && mv -Tf "$root/current-next" "$root/current"
    fi
}

ln -sfn "$release" "$root/current-next"
mv -Tf "$root/current-next" "$root/current"

# ------------------------------------------------------------------ caddy
deploy_caddy() {
    local cf=/etc/caddy/Caddyfile backup new addr sites
    echo "----- existing $cf -----"
    sudo cat "$cf" || true
    echo "------------------------"

    if ! sudo grep -qF "$MARKER" "$cf"; then
        # Only adopt a Caddyfile that is a single site proxying to the API.
        sites=$(sudo grep -cE '^[^#[:space:]({][^{]*\{[[:space:]]*$' "$cf" || true)
        unknown=$(sudo grep -vE '^[[:space:]]*(#.*)?$|^[[:space:]]*[{}][[:space:]]*$|^[^#[:space:]({][^{]*\{[[:space:]]*$|^[[:space:]]*reverse_proxy[[:space:]]+(http://)?(127\.0\.0\.1|localhost):8000[[:space:]]*$|^[[:space:]]*(encode|log)\b.*$|^[[:space:]]*root[[:space:]]+\*[[:space:]]+/usr/share/caddy[[:space:]]*$|^[[:space:]]*file_server[[:space:]]*$' "$cf" || true)
        if [ "$sites" != "1" ] || [ -n "$unknown" ]; then
            echo "ERROR: $cf has other configuration; not replacing it automatically." >&2
            [ -n "$unknown" ] && { echo "Unrecognised lines:" >&2; echo "$unknown" >&2; }
            restore_release
            exit 1
        fi
    fi
    addr=$(sudo grep -m1 -E '^[^#[:space:]({][^{]*\{[[:space:]]*$' "$cf" | sed -E 's/[[:space:]]*\{[[:space:]]*$//')
    [ -n "$domain" ] && addr="$domain"
    [ -n "$addr" ] || addr=":80"

    new=$(mktemp)
    cat > "$new" <<CADDY
$MARKER
$addr {
	encode zstd gzip
	@api path /api/* /health
	handle @api {
		reverse_proxy 127.0.0.1:8000
	}
	handle {
		root * /opt/terrasync/frontend/current
		@assets path /assets/*
		header @assets Cache-Control "public, max-age=31536000, immutable"
		header /index.html Cache-Control "no-cache"
		try_files {path} /index.html
		file_server
	}
}
CADDY
    sudo caddy validate --config "$new" --adapter caddyfile
    backup="$cf.bak-$(date -u +%Y%m%d%H%M%S)"
    sudo cp "$cf" "$backup"
    sudo cp "$new" "$cf"
    sudo chmod 644 "$cf"
    if ! sudo systemctl reload caddy; then
        echo "Caddy reload failed; restoring $backup" >&2
        sudo cp "$backup" "$cf"; sudo systemctl reload caddy || true
        restore_release; exit 1
    fi
    # Leftover from an earlier nginx attempt: keep it from fighting for port 80.
    if systemctl list-unit-files nginx.service >/dev/null 2>&1; then
        sudo systemctl disable --now nginx >/dev/null 2>&1 || true
    fi
    SITE_ADDR="$addr"; CADDY_BACKUP="$backup"
}

# ------------------------------------------------------------------ nginx
deploy_nginx() {
    local site=/etc/nginx/sites-available/terrasync enabled=/etc/nginx/sites-enabled/terrasync
    if ! command -v nginx >/dev/null 2>&1; then
        sudo apt-get update -y
        sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nginx
    fi
    cat > /tmp/terrasync-nginx.conf <<'CONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /opt/terrasync/frontend/current;
    index index.html;
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location = /health { proxy_pass http://127.0.0.1:8000/health; }
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; try_files $uri =404; }
    location / { add_header Cache-Control "no-cache"; try_files $uri $uri/ /index.html; }
}
CONF
    sudo cp /tmp/terrasync-nginx.conf "$site"
    sudo ln -sfn "$site" "$enabled"
    sudo rm -f /etc/nginx/sites-enabled/default
    if ! sudo nginx -t; then sudo rm -f "$enabled"; restore_release; exit 1; fi
    sudo systemctl enable nginx >/dev/null
    sudo systemctl reload nginx 2>/dev/null || sudo systemctl restart nginx
    if [ -n "$domain" ] && [ -n "$email" ]; then
        command -v certbot >/dev/null 2>&1 || sudo DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx
        sudo certbot --nginx -d "$domain" --non-interactive --agree-tos -m "$email" --redirect --keep-until-expiring \
            || echo "WARNING: certificate for $domain failed; serving HTTP only." >&2
    fi
    SITE_ADDR="${domain:-:80}"; CADDY_BACKUP=""
}

SITE_ADDR=""; CADDY_BACKUP=""
if [ "$server" = caddy ]; then deploy_caddy; else deploy_nginx; fi

# ------------------------------------------------------------ smoke check
host_part=${SITE_ADDR#http://}; host_part=${host_part#https://}; host_part=${host_part%%/*}
if [ -z "$host_part" ] || [[ "$host_part" == :* ]] || [[ "$host_part" =~ ^[0-9.]+(:[0-9]+)?$ ]] || [[ "$SITE_ADDR" == http://* ]]; then
    port=${host_part##*:}; [[ "$host_part" == *:* ]] || port=80
    url="http://127.0.0.1:$port"; curl_extra=()
else
    url="https://$host_part"; curl_extra=(--resolve "$host_part:443:127.0.0.1")
fi
ok=true
curl --fail --silent --show-error --retry 10 --retry-delay 2 --retry-all-errors "${curl_extra[@]}" "$url/" | grep -q 'id="root"' || ok=false
if [ "$ok" = false ]; then
    echo "Frontend smoke check failed at $url" >&2
    if [ -n "$CADDY_BACKUP" ]; then sudo cp "$CADDY_BACKUP" /etc/caddy/Caddyfile; sudo systemctl reload caddy || true; fi
    restore_release
    exit 1
fi
curl --fail --silent --retry 5 --retry-delay 1 "${curl_extra[@]}" -o /dev/null "$url/api/v1/locations" \
    && echo "API reachable through $server at $url/api/v1" \
    || echo "WARNING: frontend is up but $url/api/v1/locations did not respond." >&2

ls -1dt "$root"/releases/* 2>/dev/null | tail -n +6 | xargs -r rm -rf
echo "TerraSync frontend live via $server (site address: $SITE_ADDR, release $release)"
