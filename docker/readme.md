## Quick start

```sh
docker pull wemove/read2burn:latest

docker run -d --restart=always \
  --name read2burn \
  -p 3300:3300 \
  -v /opt/read2burn/data:/app/data \
  -e READ2BURN_PUBLIC_URL=https://read2burn.example.com \
  wemove/read2burn:latest
```

## Data persistence

Store persistent data in `/app/data`.

- If you bind-mount a host directory, ensure it’s writable by the container user (see below).

## User / permissions

The image runs as the non-root user `node` (uid `1000`) by default.

- If your mounted host directory isn’t writable by uid `1000`, either fix ownership/permissions on the host or run the container with `--user "$(id -u):$(id -g)"`.

## Configuration

Environment variables:

- **`READ2BURN_MAX_SECRET_CHARS`**: Maximum secret length. Default: `4000`.
- **`READ2BURN_PUBLIC_URL`**: Optional canonical external URL used for generating share links (recommended behind a reverse proxy).
  - **Root path**: `https://read2burn.example.com`
  - **Sub-path**: `https://read2burn.example.com/read2burn`

## Reverse proxy

If you run Read2Burn behind a reverse proxy, make sure the app sees the original request scheme/host so generated links match what users see.

- Forward (at least) `X-Forwarded-Proto` and `Host` (many proxies do this by default).
- Set `READ2BURN_PUBLIC_URL` to your external URL, especially for sub-path deployments.

Example (Nginx, root path):

```nginx
location / {
  proxy_pass http://127.0.0.1:3300;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Example (Apache, sub-path):

```apache
ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto "https"

ProxyPass        /read2burn http://localhost:3300/
ProxyPassReverse /read2burn http://localhost:3300/
```

## Image

Docker Hub: `wemove/read2burn`

