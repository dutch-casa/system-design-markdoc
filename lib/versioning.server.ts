/**
 * Versioning System - Server-Only Module
 *
 * Functions that use Node.js APIs (child_process, fs).
 * Only import this in getStaticProps, getServerSideProps, or API routes.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import {
  type Version,
  type VersionConfig,
  type VersionSource,
  parseSemVer,
  compareSemVer,
  formatVersion,
  versionSlug,
} from "./versioning";

// Re-export types for convenience
export type { Version, VersionConfig, VersionSource };

// -----------------------------------------------------------------------------
// Git-Based Versioning (Documentation)
// -----------------------------------------------------------------------------

interface GitTagInfo {
  tag: string;
  commit: string;
  date: string;
}

/**
 * Fetch version tags from git repository.
 * Returns empty array if git is unavailable or no tags exist.
 */
function getGitTags(cwd?: string): GitTagInfo[] {
  try {
    const output = execSync(
      'git tag -l "v*" --format="%(refname:short)|%(objectname:short)|%(creatordate:iso8601)"',
      {
        cwd: cwd ?? process.cwd(),
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    return output
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [tag, commit, date] = line.split("|");
        return {
          tag,
          commit,
          date: date?.split(" ")[0] ?? "",
        };
      })
      .filter((info) => parseSemVer(info.tag) !== null);
  } catch {
    // Git not available or not a git repo - graceful degradation
    return [];
  }
}

/**
 * Get documentation versions from git tags.
 * Server-side only - uses child_process.
 */
export function getDocsVersions(cwd?: string): VersionConfig {
  const tags = getGitTags(cwd);

  if (tags.length === 0) {
    // No tags yet - return a "main" version as fallback
    const mainVersion: Version = {
      tag: "main",
      name: "Development",
      slug: "main",
      isLatest: true,
    };
    return {
      current: "main",
      versions: [mainVersion],
    };
  }

  // Sort by semver descending (newest first)
  const sorted = [...tags].sort((a, b) => compareSemVer(b.tag, a.tag));
  const latestTag = sorted[0].tag;

  const versions: Version[] = sorted.map((info) => ({
    tag: info.tag,
    name: formatVersion(info.tag),
    slug: versionSlug(info.tag),
    commit: info.commit,
    date: info.date,
    isLatest: info.tag === latestTag,
  }));

  return {
    current: latestTag,
    versions,
  };
}

// -----------------------------------------------------------------------------
// File-Based Versioning (OpenAPI)
// -----------------------------------------------------------------------------

const OPENAPI_DIR = "public/openapi";

/**
 * Discover OpenAPI spec versions from filesystem.
 * Expects files named: v1.yaml, v2.yaml, v1.0.0.yaml, etc.
 */
export function getOpenAPIVersions(cwd?: string): VersionConfig {
  const baseDir = cwd ?? process.cwd();
  const openapiDir = path.join(baseDir, OPENAPI_DIR);

  // Check if directory exists
  if (!fs.existsSync(openapiDir)) {
    // Fallback: check for legacy single file
    const legacyPath = path.join(baseDir, "public", "openapi.yaml");
    if (fs.existsSync(legacyPath)) {
      const version: Version = {
        tag: "v1",
        name: "v1.0.0",
        slug: "v1",
        isLatest: true,
      };
      return {
        current: "v1",
        versions: [version],
      };
    }
    return { current: "", versions: [] };
  }

  // Scan for yaml files
  const files = fs.readdirSync(openapiDir).filter((f) => f.endsWith(".yaml"));

  const versions: Version[] = files
    .map((filename) => {
      const tag = filename.replace(".yaml", "");
      const semver = parseSemVer(tag);
      if (!semver) return null;

      return {
        tag,
        name: formatVersion(tag),
        slug: versionSlug(tag),
        isLatest: false, // Will be set below
      };
    })
    .filter((v): v is Version => v !== null)
    .sort((a, b) => compareSemVer(b.tag, a.tag));

  if (versions.length === 0) {
    return { current: "", versions: [] };
  }

  // Mark latest
  versions[0].isLatest = true;

  return {
    current: versions[0].tag,
    versions,
  };
}

/**
 * Get the file path for an OpenAPI spec version.
 */
export function getOpenAPISpecPath(version: string, cwd?: string): string {
  const baseDir = cwd ?? process.cwd();

  // Check versioned path first
  const versionedPath = path.join(baseDir, OPENAPI_DIR, `${version}.yaml`);
  if (fs.existsSync(versionedPath)) {
    return versionedPath;
  }

  // Fallback to legacy single file
  const legacyPath = path.join(baseDir, "public", "openapi.yaml");
  if (fs.existsSync(legacyPath)) {
    return legacyPath;
  }

  return versionedPath; // Return expected path even if missing
}

// -----------------------------------------------------------------------------
// Unified API
// -----------------------------------------------------------------------------

/**
 * Get versions for a specific source type.
 * Provides a unified interface for both versioning systems.
 */
export function getVersions(
  source: VersionSource,
  cwd?: string
): VersionConfig {
  switch (source) {
    case "git":
      return getDocsVersions(cwd);
    case "openapi":
      return getOpenAPIVersions(cwd);
  }
}
