# Docker build information

## Build docker image

```bash
git clone https://github.com/danstis/read2burn.git .
cd docker
docker build --no-cache -t danstis/read2burn:<VERSION> .
docker push danstis/read2burn:<VERSION>
```

## Run the docker

```bash
docker run --restart=always -d -p 3300:3300 --volume=/opt/read2burn/data:/app/data -e REL_PATH=<RELATIVE PATH, IE '/r2b'> --name read2burn danstis/read2burn:<VERSION>
```

The container runs as the non-root `node` user (uid 1000). A bind-mounted `/app/data`
must be writable by uid 1000, e.g. `chown -R 1000:1000 /opt/read2burn/data`
(or override with `--user`). Existing deployments with root-owned data need this change on upgrade.

## Apache config for sub paths

```apache
RewriteRule ^/r2b$ %{HTTPS_HOST}/r2b/ [R=permanent,L]
<Location /r2b/>
  ProxyPass http://localhost:3300/
  ProxyPassReverse http://localhost:3300/
  ProxyPreserveHost On
  RequestHeader set X-Forwarded-Proto "https"
  RequestHeader set X-Forwarded-Ssl on
</Location>
```
