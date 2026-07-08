## Domain Redirect Configuration

The application supports permanent (`301`) redirects from an old hostname to a new hostname. This is useful during domain migrations or rebranding while preserving existing URLs and SEO ranking.

### How it works

If both environment variables below are configured, the application will redirect requests from the old host to the new host:

| Environment Variable | Description                            | Example                    |
| -------------------- | -------------------------------------- | -------------------------- |
| `REDIRECT_FROM_HOST` | Hostname that should be redirected.    | `read2burn.old-domain.com` |
| `REDIRECT_TO_HOST`   | Destination hostname for the redirect. | `read2burn.new-domain.com` |

For example:

```
https://read2burn.old-domain.com/secret/abc123?download=true
```

will be redirected permanently (`301`) to:

```
https://read2burn.new-domain.com/secret/abc123?download=true
```

The path and query string are preserved.

If either variable is missing, the redirect middleware is disabled and the application behaves normally.

### Public URL

The application also uses the following setting:

| Environment Variable   | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `READ2BURN_PUBLIC_URL` | Canonical public URL used when generating links. |

Example:

```
READ2BURN_PUBLIC_URL=https://read2burn.new-domain.com
```

### Azure App Service

The recommended way to configure these values is via App Service application settings.

This repository configures them automatically during deployment using GitHub Actions and the Azure CLI.

Example:

```yaml
env:
  AZURE_RESOURCE_GROUP: ksportal
  AZURE_WEBAPP_NAME: ks-read2burn

  REDIRECT_FROM_HOST: read2burn.klarsolar.de
  REDIRECT_TO_HOST: read2burn.eon-home.de
  READ2BURN_PUBLIC_URL: https://read2burn.eon-home.de
```

More details in the [Deployment workflow](.github/workflows/master_ks-read2burn.yml):

### DNS requirements

Both the old and the new hostname must resolve to the same Azure App Service (or another component capable of serving the application).

A DNS `CNAME` record alone does **not** perform an HTTP redirect. It only resolves the hostname to the same service. The application is responsible for returning the `301 Moved Permanently` response.


read2burn
=========

A simple application for more secure password transportation. It encrypts an entry and generates a secret link. Accessing the link displays the entry and removes it at the same time.

The link can be sent by email or social media. The link can be archived without compromising the secret entry (of cource only if it has been accessed by the receipient once).

Please have a look at https://www.read2burn.com/


Dependencies
============

nodejs, npm, git


Install
=======

Install the application.

    git clone https://github.com/wemove/read2burn.git
    
Load the required modules.
    
    npm install
    
Start the application.    
    
    node app.js

Configuration
=============

You can control the maximum secret length with:

    READ2BURN_MAX_SECRET_CHARS

Default is `4000`.

To force generated share links to always use a canonical base URL, set:

    READ2BURN_PUBLIC_URL

Example:

    READ2BURN_PUBLIC_URL=https://read2burn.example.com

When this is set, link generation ignores request host/protocol headers and always uses that base URL. If unset, the application keeps the original request-based behavior.

You can also include a context path in this URL:

    READ2BURN_PUBLIC_URL=https://read2burn.example.com/read2burn

Generated links will then use that prefix (for example `https://read2burn.example.com/read2burn/?id=...`).

This value is used for both:

- the client-side textarea counter (`maxChars`)
- the server-side secret length check in the route

The URL-encoded body-parser limit is derived from this setting with additional transfer overhead, so requests are not rejected too early due to encoding expansion.


Security Trade-off (Current)
============================

At the moment, CSRF-specific protections (for example anti-CSRF tokens) are not enforced on the current POST endpoints by design.

Rationale:

- the app currently does not expose a formal authenticated API surface
- these POST routes are primarily intended for browser form flow
- adding strict CSRF/API protections now would constrain API-like request patterns planned for a later API boundary

This decision will be revisited when introducing a real API. At that point, API authentication and CSRF strategy will be defined together.


Docker
======

You can also run the application using Docker. Follow the steps below to build and run the Docker container.

Build the Docker image:

    docker build -t read2burn:latest -f docker/Dockerfile .

Run the Docker container:

    docker run -d -p 3300:3300 -e READ2BURN_MAX_SECRET_CHARS=4000 read2burn:latest

This will start the application in a Docker container and map port 3300 of the container to port 3300 on your host machine. You can access the application by navigating to

`http://localhost:3300` 

in your web browser.

Pulling from Docker Hub
------------------------

If you prefer to use a pre-built image, you can pull the latest image from Docker Hub:

    docker pull wemove/read2burn:latest

Run the Docker container using the pulled image:

    docker run -d -p 3300:3300 -e READ2BURN_MAX_SECRET_CHARS=4000 wemove/read2burn:latest

For mor information and available releases, go here: https://hub.docker.com/r/wemove/read2burn
    
