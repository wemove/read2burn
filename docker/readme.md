Run the docker

```
docker pull wemove/read2burn:latest
docker run --restart=always -d -p 3300:3300 --volume=/opt/read2burn/data:/app/data --name read2burn 
```

Apache config for sub paths

---
    <Location />
            ProxyPass http://localhost:3300/
            ProxyPassReverse http://localhost:3300/
            ProxyPreserveHost On
            RequestHeader set X-Forwarded-Proto "https"
            RequestHeader set X-Forwarded-Ssl on
    </Location>
---
