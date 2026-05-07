# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Add GitHub Action to mirror the Docker Hub repository overview from `docker/readme.md`.

### Changed

- Update Docker configuration to run as non-root user and adjust file permissions
- Update GitHub Actions Docker workflows to be compatible with the upcoming Node.js 24 runtime.

## [0.8.0]

### Added

- Add authenticated encryption for newly created secrets via `CryptorV3` (AES-256-GCM).
- Add support for configuring a canonical public base URL via `READ2BURN_PUBLIC_URL` (used when generating share links).
- Add support for configuring maximum secret length via `READ2BURN_MAX_SECRET_CHARS`.
- Add database migration to deduplicate keys and enforce unique key constraints.
- Add `SECURITY.md` and expand README security documentation.
- Add tests covering encryption, public base URL handling, max secret length limits, key collision retries, and read-once race behavior.

### Changed

- Default to `CryptorV3` for new secrets; keep `CryptorV2` for decrypting existing IDs.
- Remove deprecated `CryptorV1` and refactor crypto factory/implementations accordingly.
- Update dependencies (including `qs`, `minimatch`, `underscore`).
- Add `npm test` script using Node’s built-in test runner.

### Fixed

- Fix a race condition in database access that could break read-once behavior.

### Security

- Mitigate Host Header Injection by generating share URLs from `READ2BURN_PUBLIC_URL` when set.

## [0.7.4] - 2026-01-01

### Changed

- Enable multi-platform Docker image builds in CI workflows. #30
- Update dependencies.

## [0.7.3] - 2025-08-14

### Changed

- Update dependencies.
- Some content corrections in the descriptive text.
- Enhance Docker image release workflow with manual trigger and improved tag retrieval.

## [0.7.2] - 2024-12-29

### Added

- Add CHANGELOG.md.
- Add version and git commit id as HTML tag during docker build process.

### Changed

- Update several dependencies.
- Update documentation.

## [0.7.1] - 2024-05-09

### Added

- Add github action and switch to version scheme `va.b.c`.

### Changed

- Update several dependencies.

## [0.7.0] - 2023-11-18

### Added

- Update encryption to aes-256-cbc.
- Remove tracking code.
- Add license file.
- Disable Header "X-Powered-By: Express" for security reason.
- Better parameter validation.

### Changed

- Update several dependencies.

## [0.6.1] - 2021-03-30

### Changed

- Fix copying issue with mobile browsers.

## [0.6.0] - 2021-03-30

### Added

- Add copy button.

### Changed

- Updated jquery version.

## [0.5.0] - 2021-01-25

### Changed

- Fix loading database error during migration.
- Solve file concurrency issue.

## [0.4.0] - 2020-11-19

### Added

- Replace chaos with NeDB, optimize data processing, add migration and update layout.

## [0.3.0] - 2020-02-03

### Added

- Initial version.

[Unreleased]: https://github.com/wemove/read2burn/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/wemove/read2burn/compare/v0.7.4...v0.8.0
[0.7.4]: https://github.com/wemove/read2burn/compare/v0.7.3...v0.7.4
[0.7.3]: https://github.com/wemove/read2burn/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/wemove/read2burn/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/wemove/read2burn/compare/0.7.0...v0.7.1
[0.7.0]: https://github.com/wemove/read2burn/compare/0.6.1...0.7.0
[0.6.1]: https://github.com/wemove/read2burn/compare/0.6.0...0.6.1
[0.6.0]: https://github.com/wemove/read2burn/compare/0.5.0...0.6.0
[0.5.0]: https://github.com/wemove/read2burn/compare/0.4.0...0.5.0
[0.4.0]: https://github.com/wemove/read2burn/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/wemove/read2burn/releases/tag/0.3.0
