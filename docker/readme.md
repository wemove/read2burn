Build docker image

```
git clone https://github.com/joachimmueller/read2burn.git .
cd docker
docker build --no-cache -t wemove/read2burn:<VERSION> .

# push to wemove docker repository
docker login docker-registry.wemove.com
docker tag wemove/read2burn:<VERSION> docker-registry.wemove.com/wemove/read2burn:<VERSION>
docker push docker-registry.wemove.com/wemove/read2burn:0.2
```

Run the docker

```
docker run --restart=always -d -p 3300:3300 --volume=/opt/read2burn/data:/app/data -e REL_PATH=<RELATIVE PATH, IE '/r2b'> --name read2burn wemove/read2burn:0.1
```

Apache config for sub paths

---

    RewriteRule ^/r2b$ %{HTTPS_HOST}/r2b/ [R=permanent,L]
    <Location /r2b/>
            ProxyPass http://localhost:3300/
            ProxyPassReverse http://localhost:3300/
            ProxyPreserveHost On
            RequestHeader set X-Forwarded-Proto "https"
            RequestHeader set X-Forwarded-Ssl on
    </Location>

---
