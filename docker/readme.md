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


Build docker

```sh
cd ..
docker build -t wemove/read2burn:latest -f docker/Dockerfile .
``` 

Push image to a docker registry

```sh
docker login <docker-registry>
docker tag wemove/read2burn:latest <docker-registry or your-dockerhub-username>/read2burn:l<version>
docker push <docker-registry or your-dockerhub-username>/read2burn:<version>
```

The official Docker image is built automatically by a GitHub Action. You can find it on Docker Hub: [wemove/read2burn](https://hub.docker.com/r/wemove/read2burn)

