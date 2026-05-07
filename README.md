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
    
