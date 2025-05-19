# Changelog

## [0.2.2] - 2025-05-19

### Fixed

- Removed absolute file paths from imports.d.ts that were specific to local development environments
- Fixed module declarations in type definitions to be portable across environments

### Removed

- Deprecated CLI scripts (setup-imports-cli.js, setup-imports-cli-es.js)
- References to deprecated scripts in documentation
- Unused test script for deprecated CLI tools
- Unused imports.absolute.d.ts file that was redundant

## [0.2.1] - 2025-05-19

### Fixed

- Fixed CLI tool path resolution issues with ES modules
- Updated CLI package to use proper ES module imports
- Fixed TypeScript strict null checking errors in game templates
- Corrected import paths in generated vite.config.ts files
- Added proper definite assignment assertions to template files

### Added

- ES Module migration guide with best practices
- Additional error handling in import system

## [0.2.0] - 2025-05-19

### Added

- Standardized import system for Prometheus Engine
- New CLI tools for setting up imports in existing games
- Support for `@prometheus/engine-core` imports
- Type definitions for import paths
- Documentation for the import system

### Changed

- Updated all games to use the new import system
- Improved game templates with proper import paths
- Updated the editor to use the import system

### Removed

- Unused games (sample-spine, test-import-game, pixi-example-basic)
- Outdated setup scripts (setup-imports-cli.cjs, setup-imports-cli-es.js)

## [0.1.0] - 2025-05-01

### Added

- Initial release of the Prometheus Engine
- Basic ECS (Entity Component System) implementation
- Scene management
- Asset loading system
- Debug overlay
- Responsive layout support
