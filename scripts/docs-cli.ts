#!/usr/bin/env bun
/**
 * CLI tool for scaffolding architecture documentation pages and groups.
 *
 * Usage:
 *   bun run scripts/docs-cli.ts new:group <name> [--icon <IconName>]
 *   bun run scripts/docs-cli.ts new:page <group-slug> <page-name>
 *   bun run scripts/docs-cli.ts list
 *
 * Examples:
 *   bun run scripts/docs-cli.ts new:group "Domain Model" --icon Database
 *   bun run scripts/docs-cli.ts new:page domain-model entities
 *   bun run scripts/docs-cli.ts new:page domain-model "Value Objects"
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { join, resolve } from "path";

const ROOT = resolve(import.meta.dir, "..");
const PAGES_DIR = join(ROOT, "pages");
const NAVIGATION_FILE = join(ROOT, "lib", "navigation.ts");

// Common lucide-react icons for documentation sections
const ICON_SUGGESTIONS = [
  "BookOpen",
  "Database",
  "FileText",
  "Folder",
  "Code",
  "Server",
  "Shield",
  "Workflow",
  "GitBranch",
  "Layers",
  "Box",
  "Cpu",
  "Globe",
  "Lock",
  "Settings",
  "Terminal",
  "Zap",
  "Activity",
  "Archive",
  "Briefcase",
] as const;

type IconName = (typeof ICON_SUGGESTIONS)[number];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(text: string): string {
  return text
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function parseArgs(args: string[]): {
  command: string;
  positional: string[];
  flags: Record<string, string>;
} {
  const command = args[0] || "help";
  const positional: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      flags[key] = args[i + 1] || "true";
      i++;
    } else {
      positional.push(args[i]);
    }
  }

  return { command, positional, flags };
}

function readNavigation(): string {
  return readFileSync(NAVIGATION_FILE, "utf-8");
}

function writeNavigation(content: string): void {
  writeFileSync(NAVIGATION_FILE, content);
}

function getExistingGroups(): { slug: string; title: string }[] {
  const navContent = readNavigation();
  const groups: { slug: string; title: string }[] = [];

  // Parse NAV_SECTIONS array for titles
  const sectionMatches = navContent.matchAll(/title:\s*["']([^"']+)["']/g);
  for (const match of sectionMatches) {
    groups.push({
      title: match[1],
      slug: slugify(match[1]),
    });
  }

  return groups;
}

function findGroupDirectory(groupSlug: string): string | null {
  // Check if a directory exists that matches the slug
  const entries = readdirSync(PAGES_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && slugify(entry.name) === groupSlug) {
      return entry.name;
    }
  }

  return null;
}

function createMarkdownPage(options: {
  filePath: string;
  title: string;
  description: string;
  template?: "default" | "adr" | "index";
}): void {
  const { filePath, title, description, template = "default" } = options;

  let content: string;

  switch (template) {
    case "index":
      content = `---
title: ${title}
description: ${description}
---

# ${title}

${description}

## Overview

<!-- Add section overview here -->

## Topics

<!-- Topics in this section will be listed here -->
`;
      break;

    case "adr":
      content = `---
title: ${title}
description: ${description}
---

# ${title}

{% adr id="XXX" title="${title}" status="proposed" date="${
        new Date().toISOString().split("T")[0]
      }" %}

## Context

<!-- What situation led to this decision? -->

## Decision

<!-- What was decided? -->

## Consequences

<!-- What are the positive and negative outcomes? -->

{% /adr %}
`;
      break;

    default:
      content = `---
title: ${title}
description: ${description}
---

# ${title}

${description}

## Overview

<!-- Add content here -->
`;
  }

  writeFileSync(filePath, content);
  console.log(`  Created: ${filePath}`);
}

function addIconImport(navContent: string, iconName: string): string {
  // Check if icon is already imported
  const importMatch = navContent.match(
    /import\s*{([^}]+)}\s*from\s*["']lucide-react["']/
  );

  if (!importMatch) {
    // No lucide import found, add one
    return `import { ${iconName}, LucideIcon } from "lucide-react";\n\n${navContent}`;
  }

  const existingImports = importMatch[1];
  if (existingImports.includes(iconName)) {
    return navContent; // Already imported
  }

  // Add to existing import
  const newImports =
    existingImports.trim().replace(/,?\s*$/, "") + `, ${iconName}`;
  return navContent.replace(
    importMatch[0],
    `import { ${newImports} } from "lucide-react"`
  );
}

function addNavSection(
  navContent: string,
  section: { title: string; icon: string; basePath: string }
): string {
  // Find the NAV_SECTIONS array start position
  const sectionsMatch = navContent.match(
    /export const NAV_SECTIONS:\s*NavSection\[\]\s*=\s*\[/
  );
  if (!sectionsMatch || sectionsMatch.index === undefined) {
    console.error("Could not find NAV_SECTIONS array in navigation.ts");
    process.exit(1);
  }

  const newSection = `  {
    title: "${section.title}",
    icon: ${section.icon},
    links: [{ href: "/${section.basePath}", label: "Overview" }],
  },
`;

  // Find the closing bracket of NAV_SECTIONS by counting brackets from the start
  const startIndex = sectionsMatch.index + sectionsMatch[0].length;
  let depth = 1;
  let insertPosition = -1;

  for (let i = startIndex; i < navContent.length; i++) {
    const char = navContent[i];
    if (char === "[") depth++;
    else if (char === "]") {
      depth--;
      if (depth === 0) {
        insertPosition = i;
        break;
      }
    }
  }

  if (insertPosition === -1) {
    console.error("Could not find end of NAV_SECTIONS array");
    process.exit(1);
  }

  return (
    navContent.slice(0, insertPosition) +
    newSection +
    navContent.slice(insertPosition)
  );
}

function addNavLink(
  navContent: string,
  groupTitle: string,
  link: { href: string; label: string }
): string {
  // Find the section by title and add link to its links array
  const sectionRegex = new RegExp(
    `(title:\\s*["']${groupTitle}["'][^}]*links:\\s*\\[)([^\\]]*)(\\])`,
    "s"
  );

  const match = navContent.match(sectionRegex);
  if (!match) {
    console.error(`Could not find section "${groupTitle}" in navigation.ts`);
    process.exit(1);
  }

  const existingLinks = match[2];
  const newLink = `{ href: "${link.href}", label: "${link.label}" },`;

  // Add new link at end of links array
  const updatedLinks =
    existingLinks.trimEnd().replace(/,?\s*$/, "") + `\n      ${newLink}\n    `;

  return navContent.replace(sectionRegex, `$1${updatedLinks}$3`);
}

// Command handlers

function handleNewGroup(
  positional: string[],
  flags: Record<string, string>
): void {
  const name = positional[0];
  if (!name) {
    console.error("Usage: new:group <name> [--icon <IconName>]");
    console.error("\nAvailable icons:", ICON_SUGGESTIONS.join(", "));
    process.exit(1);
  }

  const title = titleCase(name);
  const slug = slugify(name);
  const icon = (flags.icon || "BookOpen") as IconName;
  const dirPath = join(PAGES_DIR, slug);

  if (!ICON_SUGGESTIONS.includes(icon as any)) {
    console.warn(`Warning: "${icon}" may not be a valid lucide-react icon`);
    console.log("Suggested icons:", ICON_SUGGESTIONS.join(", "));
  }

  // Check if group already exists
  if (existsSync(dirPath)) {
    console.error(`Directory already exists: ${dirPath}`);
    process.exit(1);
  }

  console.log(`Creating new group: "${title}"`);

  // Create directory
  mkdirSync(dirPath, { recursive: true });
  console.log(`  Created: ${dirPath}/`);

  // Create index page
  createMarkdownPage({
    filePath: join(dirPath, "index.md"),
    title,
    description: `Documentation for ${title}`,
    template: "index",
  });

  // Update navigation.ts
  let navContent = readNavigation();
  navContent = addIconImport(navContent, icon);
  navContent = addNavSection(navContent, { title, icon, basePath: slug });
  writeNavigation(navContent);
  console.log(`  Updated: lib/navigation.ts`);

  console.log(`\nDone! New group "${title}" created at /${slug}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Edit pages/${slug}/index.md`);
  console.log(
    `  2. Add pages with: bun run scripts/docs-cli.ts new:page ${slug} <page-name>`
  );
}

function handleNewPage(
  positional: string[],
  flags: Record<string, string>
): void {
  const [groupSlug, pageName] = positional;

  if (!groupSlug || !pageName) {
    console.error(
      "Usage: new:page <group-slug> <page-name> [--template default|adr]"
    );
    const groups = getExistingGroups();
    if (groups.length > 0) {
      console.error("\nExisting groups:");
      groups.forEach((g) => console.error(`  - ${g.slug} ("${g.title}")`));
    }
    process.exit(1);
  }

  const template = (flags.template || "default") as "default" | "adr" | "index";
  const dirName = findGroupDirectory(groupSlug);

  if (!dirName) {
    console.error(`Group directory not found for slug: ${groupSlug}`);
    console.error(
      "Create it first with: bun run scripts/docs-cli.ts new:group <name>"
    );
    process.exit(1);
  }

  const pageSlug = slugify(pageName);
  const pageTitle = titleCase(pageName);
  const filePath = join(PAGES_DIR, dirName, `${pageSlug}.md`);

  if (existsSync(filePath)) {
    console.error(`Page already exists: ${filePath}`);
    process.exit(1);
  }

  console.log(`Creating new page: "${pageTitle}" in ${dirName}/`);

  // Create the page
  createMarkdownPage({
    filePath,
    title: pageTitle,
    description: `Documentation for ${pageTitle}`,
    template,
  });

  // Find group title from navigation
  const groups = getExistingGroups();
  const group = groups.find(
    (g) => g.slug === groupSlug || g.slug === slugify(dirName)
  );

  if (group) {
    // Update navigation.ts
    let navContent = readNavigation();
    navContent = addNavLink(navContent, group.title, {
      href: `/${dirName}/${pageSlug}`,
      label: pageTitle,
    });
    writeNavigation(navContent);
    console.log(`  Updated: lib/navigation.ts`);
  } else {
    console.warn(
      `  Warning: Could not find group in navigation.ts. Add link manually.`
    );
  }

  console.log(`\nDone! New page created at /${dirName}/${pageSlug}`);
}

function handleList(): void {
  console.log("Documentation structure:\n");

  const groups = getExistingGroups();

  for (const group of groups) {
    const dirName = findGroupDirectory(group.slug);
    console.log(`${group.title} (/${group.slug})`);

    if (dirName) {
      const dirPath = join(PAGES_DIR, dirName);
      const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
      files.forEach((file) => {
        const name = file.replace(".md", "");
        console.log(`  - ${name === "index" ? "index (Overview)" : name}`);
      });
    }
    console.log();
  }
}

function handleHelp(): void {
  console.log(`
Architecture Docs CLI

Commands:
  new:group <name> [--icon <IconName>]    Create a new documentation group
  new:page <group-slug> <name>            Add a page to an existing group
  list                                    List all groups and pages
  help                                    Show this help message

Options:
  --icon <IconName>    Lucide icon name for the group (default: BookOpen)
  --template <type>    Page template: default, adr, index

Examples:
  bun run scripts/docs-cli.ts new:group "Domain Model" --icon Database
  bun run scripts/docs-cli.ts new:page domain-model entities
  bun run scripts/docs-cli.ts new:page domain-model "Value Objects" --template default
  bun run scripts/docs-cli.ts list

Available Icons:
  ${ICON_SUGGESTIONS.join(", ")}
`);
}

// Main
const args = process.argv.slice(2);
const { command, positional, flags } = parseArgs(args);

switch (command) {
  case "new:group":
    handleNewGroup(positional, flags);
    break;
  case "new:page":
    handleNewPage(positional, flags);
    break;
  case "list":
    handleList();
    break;
  case "help":
  default:
    handleHelp();
    break;
}
