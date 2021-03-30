![](https://travis-ci.org/wemove/read2burn.svg?branch=master)

# read2burn

A simple application for more secure password transportation. It encrypts an entry and generates a secret link. Accessing the link displays the entry and removes it at the same time.

The link can be sent by email and the email can be archived without compromising the secret entry (of cource only if it has been accessed by the receipient once).

Please have a look at https://www.read2burn.com/

# Dependencies

nodejs, npm, git

# Install

Install the application.

    git clone https://github.com/wemove/read2burn.git

Load the required modules.

    npm install

Start the application.

    node app.js
