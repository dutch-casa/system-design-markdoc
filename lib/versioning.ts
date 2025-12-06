/**
 * Versioning System - Client-Safe Module
 *
 * Types and utilities that can be used on both client and server.
 * Server-only functions (git commands, filesystem) are in versioning.server.ts
 */

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface Version {
  /** Version identifier (e.g., "v1.0.0", "v2.1.0") */
  tag: string;
  /** Human-readable display name */
  name: string;
  /** Short identifier for URLs and paths */
  slug: string;
  /** Source commit hash (git versions only) */
  commit?: string;
  /** Release date in ISO format */
  date?: string;
  /** Whether this is the latest/current version */
  isLatest: boolean;
}

export interface VersionConfig {
  /** Current/latest version tag */
  current: string;
  /** All available versions, newest first */
  versions: Version[];
}

export type VersionSource = "git" | "openapi";

// -----------------------------------------------------------------------------
// Semver Utilities
// -----------------------------------------------------------------------------

interface SemVer {
  major: number;
  minor: number;
  patch: number;
  raw: string;
}

/**
 * Parse a version string into semver components.
 * Accepts: v1.0.0, 1.0.0, v1.0, v1, etc.
 */
export function parseSemVer(tag: string): SemVer | null {
  const match = tag.match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2] ?? "0", 10),
    patch: parseInt(match[3] ?? "0", 10),
    raw: tag,
  };
}

/**
 * Compare two versions. Returns negative if a < b, positive if a > b, 0 if equal.
 */
export function compareSemVer(a: string, b: string): number {
  const semA = parseSemVer(a);
  const semB = parseSemVer(b);

  if (!semA || !semB) return a.localeCompare(b);

  const majorDiff = semA.major - semB.major;
  if (majorDiff !== 0) return majorDiff;

  const minorDiff = semA.minor - semB.minor;
  if (minorDiff !== 0) return minorDiff;

  return semA.patch - semB.patch;
}

/**
 * Format a version tag for display (normalizes to v1.0.0 format).
 */
export function formatVersion(tag: string): string {
  const semver = parseSemVer(tag);
  if (!semver) return tag;
  return `v${semver.major}.${semver.minor}.${semver.patch}`;
}

/**
 * Extract slug from version tag (v1.0.0 -> v1.0.0, v1 -> v1).
 */
export function versionSlug(tag: string): string {
  return tag.startsWith("v") ? tag : `v${tag}`;
}

// -----------------------------------------------------------------------------
// Path Utilities (Client-Safe)
// -----------------------------------------------------------------------------

/**
 * Rewrite a path to target a different version.
 * /docs/v1/getting-started -> /docs/v2/getting-started
 */
export function rewritePathVersion(
  currentPath: string,
  targetVersion: string
): string {
  // Match /docs/v{version}/rest or /api-docs/v{version}/rest
  const versionedPattern = /^(\/[^/]+\/)(v[\d.]+)(\/.*)?$/;
  const match = currentPath.match(versionedPattern);

  if (match) {
    const [, prefix, , suffix] = match;
    return `${prefix}${targetVersion}${suffix ?? ""}`;
  }

  // No version in path - this is the unversioned default
  return currentPath;
}

/**
 * Extract version from a path.
 */
export function extractPathVersion(urlPath: string): string | null {
  const match = urlPath.match(/\/(v[\d.]+)(?:\/|$)/);
  return match ? match[1] : null;
}

// -----------------------------------------------------------------------------
// Version Helpers (Client-Safe)
// -----------------------------------------------------------------------------

/**
 * Find a specific version by tag.
 */
export function findVersion(
  config: VersionConfig,
  tag: string
): Version | undefined {
  return config.versions.find((v) => v.tag === tag || v.slug === tag);
}

/**
 * Get the latest version.
 */
export function getLatestVersion(config: VersionConfig): Version | undefined {
  return config.versions.find((v) => v.isLatest);
}

/**
 * Sort versions in descending order (newest first).
 */
export function sortVersions(versions: Version[]): Version[] {
  return [...versions].sort((a, b) => compareSemVer(b.tag, a.tag));
}
