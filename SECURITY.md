# Security Policy

## Supported Versions

Security fixes are provided on a best-effort basis for the latest code on the default branch.

If you are running an older version, please first reproduce the issue against the latest commit before reporting.

## Reporting a Vulnerability

Please do **not** open a public GitHub issue for suspected vulnerabilities.

Instead, report vulnerabilities privately by email:

- `contact@wemove.com`

Include as much detail as possible:

- affected version or commit SHA
- deployment context (self-hosted, Docker, etc.)
- clear reproduction steps or proof of concept
- impact assessment (confidentiality/integrity/availability)
- any suggested mitigation

## Scope Notes

Please only test systems you own or are explicitly authorized to test.

Do not run destructive tests, denial-of-service attempts, or access data belonging to others.

## Cryptography Notes

Newly created secrets use authenticated encryption, so ciphertext tampering is detected during decryption.
Legacy secrets created by older versions may still use older encryption formats for backward compatibility.
