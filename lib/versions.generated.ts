/**
 * Generated version configuration.
 *
 * This file is generated at build time by scripts that scan git tags.
 * For development, it provides sensible defaults.
 *
 * To regenerate: run `bun run generate:versions`
 */

import type { VersionConfig } from "./versioning";

/**
 * Documentation versions from git tags.
 * Empty until first release tag is created.
 */
export const DOCS_VERSION_CONFIG: VersionConfig = {
  current: "main",
  versions: [
    {
      tag: "main",
      name: "Development",
      slug: "main",
      isLatest: true,
    },
  ],
};

/**
 * Check if docs versioning should be shown.
 * Only show when there are multiple versions (after first release).
 */
export const SHOW_DOCS_VERSIONS = DOCS_VERSION_CONFIG.versions.length > 1;
