/**
 * Backlinks system for tracking bidirectional relationships between pages.
 * Extracts links from markdown content and Mermaid diagrams.
 */

export interface BacklinkEntry {
  /** The page that contains the link */
  sourcePath: string;
  /** Title of the source page */
  sourceTitle: string;
  /** Type of link: markdown link or mermaid diagram */
  linkType: "markdown" | "mermaid";
}

export interface BacklinksIndex {
  /** Map from target path to array of pages that link to it */
  [targetPath: string]: BacklinkEntry[];
}

/**
 * Extract markdown links from content
 * Matches [text](/path) and [text](../path)
 */
export function extractMarkdownLinks(content: string): string[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    const href = match[2];
    // Only internal links starting with / or relative paths
    if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) {
      links.push(normalizeInternalPath(href));
    }
  }

  return links;
}

/**
 * Extract click directives from Mermaid diagrams
 * Matches: click NodeID "/path/to/page"
 */
export function extractMermaidLinks(content: string): string[] {
  const clickRegex = /click\s+\w+\s+"([^"]+)"/g;
  const links: string[] = [];
  let match;

  while ((match = clickRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith("/")) {
      links.push(normalizeInternalPath(href));
    }
  }

  return links;
}

/**
 * Normalize internal paths to consistent format
 * /docs/page.md -> /docs/page
 * ./page -> /current-dir/page
 */
function normalizeInternalPath(path: string): string {
  // Remove .md extension
  let normalized = path.replace(/\.md$/, "");

  // Remove trailing slashes
  normalized = normalized.replace(/\/$/, "");

  // Remove hash fragments
  normalized = normalized.split("#")[0];

  return normalized;
}

/**
 * Extract all links (markdown + mermaid) from page content
 */
export function extractAllLinks(content: string): {
  markdownLinks: string[];
  mermaidLinks: string[];
} {
  return {
    markdownLinks: extractMarkdownLinks(content),
    mermaidLinks: extractMermaidLinks(content),
  };
}

/**
 * Build backlinks index from all pages
 */
export function buildBacklinksIndex(
  pages: Array<{
    path: string;
    title: string;
    content: string;
  }>
): BacklinksIndex {
  const index: BacklinksIndex = {};

  for (const page of pages) {
    const { markdownLinks, mermaidLinks } = extractAllLinks(page.content);

    // Process markdown links
    for (const targetPath of markdownLinks) {
      if (!index[targetPath]) {
        index[targetPath] = [];
      }
      index[targetPath].push({
        sourcePath: page.path,
        sourceTitle: page.title,
        linkType: "markdown",
      });
    }

    // Process mermaid links
    for (const targetPath of mermaidLinks) {
      if (!index[targetPath]) {
        index[targetPath] = [];
      }
      index[targetPath].push({
        sourcePath: page.path,
        sourceTitle: page.title,
        linkType: "mermaid",
      });
    }
  }

  return index;
}

/**
 * Get backlinks for a specific page
 */
export function getBacklinksForPage(
  pagePath: string,
  index: BacklinksIndex
): BacklinkEntry[] {
  const normalized = normalizeInternalPath(pagePath);
  return index[normalized] || [];
}
