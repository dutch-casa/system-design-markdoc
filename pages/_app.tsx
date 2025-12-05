import React from "react";
import Head from "next/head";
import Link from "next/link";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CommandDialog } from "@/components/CommandDialog";
import { SideNav } from "@/components/SideNav";
import { TableOfContents } from "@/components/TableOfContents";
import {
  TopNav,
  TopNavBrand,
  TopNavLinks,
  TopNavLink,
  TopNavSearch,
} from "@/components/TopNav";

import "prismjs";
import "prismjs/components/prism-bash.min";
import "prismjs/themes/prism.css";

import "katex/dist/katex.min.css";

import "@/public/globals.css";

import type { AppProps } from "next/app";
import type { MarkdocNextJsPageProps } from "@markdoc/next.js";

const queryClient = new QueryClient();

const TITLE = "Architecture";
const DESCRIPTION = "System architecture documentation";

function generateSlug(id: string, title: string): string {
  return `adr-${id}-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

function isADRNode(node: any): boolean {
  // Check for ADR-specific attributes: id, title, status, date
  const attrs = node.attributes || {};
  return (
    typeof attrs.id === "string" &&
    typeof attrs.title === "string" &&
    typeof attrs.status === "string" &&
    typeof attrs.date === "string"
  );
}

function collectHeadings(node: any, sections: any[] = []): any[] {
  if (node) {
    // Collect standard headings
    if (node.name === "Heading") {
      const title = node.children[0];

      if (typeof title === "string") {
        sections.push({
          ...node.attributes,
          title,
        });
      }
    }

    // Collect ADR titles (detect by presence of ADR-specific attributes)
    if (isADRNode(node)) {
      const { id, title } = node.attributes;
      sections.push({
        level: 3,
        id: generateSlug(id, title),
        title,
      });
      // Don't recurse into ADR children - we don't want inner content in TOC
      return sections;
    }

    if (node.children) {
      for (const child of node.children) {
        collectHeadings(child, sections);
      }
    }
  }

  return sections;
}

export type MyAppProps = MarkdocNextJsPageProps;

export default function MyApp({
  Component,
  pageProps,
  router,
}: AppProps<MyAppProps>) {
  const { markdoc } = pageProps;

  // Pages that manage their own layout
  const isCustomLayoutPage = router.pathname === "/api-docs";

  let title = TITLE;
  let description = DESCRIPTION;
  if (markdoc) {
    if (markdoc.frontmatter.title) {
      title = `${markdoc.frontmatter.title} | ${TITLE}`;
    }
    if (markdoc.frontmatter.description) {
      description = markdoc.frontmatter.description;
    }
  }

  const toc = pageProps.markdoc?.content
    ? collectHeadings(pageProps.markdoc.content)
    : [];

  // Custom layout pages manage everything themselves
  if (isCustomLayoutPage) {
    return (
      <QueryClientProvider client={queryClient}>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta name="referrer" content="strict-origin" />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <CommandDialog />
        <Component {...pageProps} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="strict-origin" />
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopNav>
        <TopNavBrand asChild>
          <Link href="/">Architecture</Link>
        </TopNavBrand>
        <TopNavLinks>
          <TopNavLink asChild>
            <Link href="/docs">Docs</Link>
          </TopNavLink>
          <TopNavLink asChild>
            <Link href="/api-docs">API</Link>
          </TopNavLink>
          <TopNavSearch />
        </TopNavLinks>
      </TopNav>
      <CommandDialog />
      <div className="page-layout">
        <SideNav />
        <main className="page-content">
          <div className="page-content-wrapper">
            <Component {...pageProps} />
          </div>
        </main>
        <TableOfContents toc={toc} />
      </div>
      <style jsx>{`
        .page-layout {
          position: fixed;
          top: var(--top-nav-height, 65px);
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          width: 100vw;
          height: calc(100vh - var(--top-nav-height, 65px));
        }

        .page-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          width: 100%;
        }

        .page-content-wrapper {
          max-width: var(--content-max-width, 800px);
          margin: 0 auto;
          padding: var(--spacing-10, 2.5rem) var(--spacing-8, 2rem)
            var(--spacing-12, 3rem);
          padding-bottom: calc(var(--spacing-12, 3rem) + 100vh);
        }

        .page-content-wrapper :global(h1:first-child) {
          margin-top: 0;
        }

        .page-content-wrapper :global(p:last-child) {
          margin-bottom: 0;
        }
      `}</style>
    </QueryClientProvider>
  );
}
