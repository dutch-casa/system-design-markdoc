/**
 * Git-based versioning system for architecture documentation.
 * Uses git tags to manage different versions of documentation.
 */

export interface Version {
  /** Version tag (e.g., "v1.0.0", "v2.1.0") */
  tag: string;
  /** Human-readable version name */
  name: string;
  /** Commit hash */
  commit: string;
  /** Date of version */
  date: string;
  /** Whether this is the latest version */
  isLatest: boolean;
}

/**
 * Parse version from git tag
 * Supports formats: v1.0.0, 1.0.0, v1.0, etc.
 */
export function parseVersion(tag: string): {
  major: number;
  minor: number;
  patch: number;
} | null {
  const match = tag.match(/^v?(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3] || "0", 10),
  };
}

/**
 * Compare two version tags
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const versionA = parseVersion(a);
  const versionB = parseVersion(b);

  if (!versionA || !versionB) {
    return a.localeCompare(b);
  }

  if (versionA.major !== versionB.major) {
    return versionA.major - versionB.major;
  }
  if (versionA.minor !== versionB.minor) {
    return versionA.minor - versionB.minor;
  }
  return versionA.patch - versionB.patch;
}

/**
 * Sort versions in descending order (newest first)
 */
export function sortVersions(versions: Version[]): Version[] {
  return [...versions].sort((a, b) => compareVersions(b.tag, a.tag));
}

/**
 * Get version path for a document
 * /docs/v1/page -> /docs/v2/page
 */
export function getVersionedPath(
  currentPath: string,
  targetVersion: string
): string {
  // Match pattern: /docs/{version}/rest/of/path
  const match = currentPath.match(/^(\/[^/]+\/)([^/]+)(\/.*)?$/);

  if (!match) {
    // No version in path, add it
    return `${currentPath.replace(/\/$/, "")}/${targetVersion}`;
  }

  const [, base, , rest] = match;
  return `${base}${targetVersion}${rest || ""}`;
}

/**
 * Extract current version from path
 */
export function getVersionFromPath(path: string): string | null {
  const match = path.match(/\/v(\d+(?:\.\d+)*(?:\.\d+)?)\//);
  return match ? `v${match[1]}` : null;
}

/**
 * Check if a version tag is valid semver
 */
export function isValidVersionTag(tag: string): boolean {
  return parseVersion(tag) !== null;
}

/**
 * Format version for display
 */
export function formatVersionName(tag: string): string {
  const version = parseVersion(tag);
  if (!version) return tag;

  return `v${version.major}.${version.minor}.${version.patch}`;
}

/**
 * Get version metadata (this would typically call git commands on the server)
 * For now, returns a mock implementation
 */
export async function getAvailableVersions(): Promise<Version[]> {
  // This would run: git tag -l "v*" --format="%(refname:short)|%(objectname:short)|%(creatordate:iso8601)"
  // For now, return mock data
  return [
    {
      tag: "v2.0.0",
      name: "Version 2.0.0",
      commit: "abc1234",
      date: "2024-03-01",
      isLatest: true,
    },
    {
      tag: "v1.5.0",
      name: "Version 1.5.0",
      commit: "def5678",
      date: "2024-02-01",
      isLatest: false,
    },
    {
      tag: "v1.0.0",
      name: "Version 1.0.0",
      commit: "ghi9012",
      date: "2024-01-01",
      isLatest: false,
    },
  ];
}
