read2burn
=========

A simple application for more secure password transportation. It encrypts an entry and generates a secret link. Accessing the link displays the entry and removes it at the same time.

The link can be sent by email and the email can be archived without compromising the secret entry (of cource only if it has been accessed by the receipient once).

Please have a look at https://www.read2burn.com/


Dependencies
============

nodejs, git


Install
=======

Install the applocation.

    git clone https://github.com/joachimmueller/read2burn.git
    
Load the required modules.    
    
    npm install
    
Start the application.    
    
    server app.js
    
    
