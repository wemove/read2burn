# read2burn

[![Build Test and Release](https://github.com/danstis/read2burn/actions/workflows/build.yml/badge.svg)](https://github.com/danstis/read2burn/actions/workflows/build.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=danstis_read2burn&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=danstis_read2burn)

A simple application for more secure password transportation. It encrypts an entry and generates a secret link. Accessing the link displays the entry and removes it at the same time.

The link can be sent by email and the email can be archived without compromising the secret entry (of course only if it has been accessed by the recipient once).

Please have a look at https://www.read2burn.com/

## Dependencies

nodejs, npm, git

## Install

Install the application.

    `git clone https://github.com/wemove/read2burn.git`

Load the required modules.

    `npm install`

Start the application.

    `node app.js`
