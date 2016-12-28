Build docker image

```
git clone https://github.com/joachimmueller/read2burn.git .
cd docker
docker build -t wemove/read2burn:0.1 .
```

Run the docker

```
docker run --restart=always -d -p 3300:3300 --volume=/opt/read2burn/data:/app/data --name read2burn wemove/read2burn:0.1
```
