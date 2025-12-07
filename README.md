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


Docker
======

You can also run the application using Docker. Follow the steps below to build and run the Docker container.

Build the Docker image:

    docker build -t read2burn:latest -f docker/Dockerfile .

Run the Docker container:

    docker run -d -p 3300:3300 read2burn:latest

This will start the application in a Docker container and map port 3300 of the container to port 3300 on your host machine. You can access the application by navigating to

`http://localhost:3300` 

in your web browser.

Pulling from Docker Hub
------------------------

If you prefer to use a pre-built image, you can pull the latest image from Docker Hub:

    docker pull wemove/read2burn:latest

Run the Docker container using the pulled image:

    docker run -d -p 3300:3300 wemove/read2burn:latest

For mor information and available releases, go here: https://hub.docker.com/r/wemove/read2burn
    
