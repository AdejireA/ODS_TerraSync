#!/usr/bin/env bash
# Installs a frontend build on the Nobus VM behind nginx.
#   - Serves /opt/terrasync/frontend/current (SPA, index.html fallback)
#   - Proxies /api/ and /health to the API on 127.0.0.1:8000
#   - Optional HTTPS when TERRASYNC_DOMAIN and TERRASYNC_CERT_EMAIL are set
# Rolls back the release and nginx site if the config test or smoke check fails.
set -euo pipefail
archive=${1:?Supply frontend archive path}
domain=${TERRASYNC_DOMAIN:-}
email=${TERRASYNC_CERT_EMAIL:-}
root=/opt/terrasync/frontend
release="$root/releases/$(date -u +%Y%m%d%H%M%S)-$$"
site=/etc/nginx/sites-available/terrasync
enabled=/etc/nginx/sites-enabled/terrasync

sudo mkdir -p "$root/releases"
sudo chown ubuntu:ubuntu /opt/terrasync "$root" "$root/releases" 2>/dev/null || sudo chown ubuntu:ubuntu "$root" "$root/releases"
mkdir -p "$release"
tar -xzf "$archive" -C "$release"
test -f "$release/index.html" || { echo "Build has no index.html" >&2; exit 1; }
# nginx (www-data) must be able to read the files and traverse the parents.
chmod -R a+rX "$release"
sudo chmod o+x /opt/terrasync "$root" "$root/releases"

if ! command -v nginx >/dev/null 2>&1; then
    sudo apt-get update -y
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nginx
fi

cert_dir=""
if [ -n "$domain" ] && [ -n "$email" ]; then
    if ! command -v certbot >/dev/null 2>&1; then
        sudo DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx
    fi
    if [ -f "/etc/letsencrypt/live/$domain/fullchain.pem" ] || \
       sudo certbot certonly --nginx -d "$domain" --non-interactive --agree-tos -m "$email" --keep-until-expiring; then
        cert_dir="/etc/letsencrypt/live/$domain"
    else
        echo "WARNING: could not obtain a certificate for $domain; serving HTTP only." >&2
    fi
fi

server_name=${domain:-_}
app_locations=$(cat <<'LOC'
    root /opt/terrasync/frontend/current;
    index index.html;
    client_max_body_size 2m;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }
    location = /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    location / {
        add_header Cache-Control "no-cache";
        try_files $uri $uri/ /index.html;
    }
LOC
)

new_site=$(mktemp)
if [ -n "$cert_dir" ]; then
    cat > "$new_site" <<CONF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $server_name;
    location /.well-known/acme-challenge/ { root /var/www/html; }
    location / { return 301 https://\$host\$request_uri; }
}
server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name $server_name;
    ssl_certificate $cert_dir/fullchain.pem;
    ssl_certificate_key $cert_dir/privkey.pem;
$app_locations
}
CONF
else
    cat > "$new_site" <<CONF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name $server_name;
$app_locations
}
CONF
fi

previous_release=$(readlink -f "$root/current" 2>/dev/null || true)
previous_site=$(mktemp)
had_site=false
if [ -f "$site" ]; then sudo cp "$site" "$previous_site"; had_site=true; fi
removed_default=false

rollback() {
    echo "Rolling back frontend deploy" >&2
    if [ -n "$previous_release" ] && [ -d "$previous_release" ]; then
        ln -sfn "$previous_release" "$root/current-next" && mv -Tf "$root/current-next" "$root/current"
    fi
    if [ "$had_site" = true ]; then sudo cp "$previous_site" "$site"; else sudo rm -f "$site" "$enabled"; fi
    if [ "$removed_default" = true ]; then sudo ln -sfn /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default; fi
    sudo nginx -t >/dev/null 2>&1 && sudo systemctl reload nginx || true
}

sudo cp "$new_site" "$site"
sudo ln -sfn "$site" "$enabled"
# The stock Ubuntu default site also claims default_server on port 80.
if [ -L /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
    removed_default=true
fi
ln -sfn "$release" "$root/current-next"
mv -Tf "$root/current-next" "$root/current"

if ! sudo nginx -t; then
    echo "nginx config test failed (another site may already use port 80)." >&2
    rollback
    exit 1
fi
sudo systemctl enable nginx >/dev/null
sudo systemctl reload nginx || sudo systemctl restart nginx

scheme=http
[ -n "$cert_dir" ] && scheme=https
check_host=${domain:-127.0.0.1}
curl_opts=(--fail --silent --show-error --retry 5 --retry-delay 1)
[ -z "$cert_dir" ] || curl_opts+=(--resolve "$check_host:443:127.0.0.1")
if ! curl "${curl_opts[@]}" "$scheme://$check_host/" | grep -q 'id="root"'; then
    echo "Frontend smoke check failed" >&2
    rollback
    exit 1
fi
if ! curl "${curl_opts[@]}" -o /dev/null "$scheme://$check_host/api/v1/locations"; then
    echo "WARNING: frontend is up but /api/v1/locations did not respond through nginx." >&2
fi

# Keep the five most recent releases.
ls -1dt "$root"/releases/* 2>/dev/null | tail -n +6 | xargs -r rm -rf
printf 'TerraSync frontend live at %s://%s (release %s)\n' "$scheme" "${domain:-<server IP>}" "$release"
