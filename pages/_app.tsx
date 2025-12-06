import React, { useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";

import { AppLayout, useAppLayout } from "@/components/AppLayout";
import { CommandDialog } from "@/components/CommandDialog";
import { SideNav } from "@/components/SideNav";
import { TableOfContents } from "@/components/TableOfContents";
import {
  TopNav,
  TopNavMenuTrigger,
  TopNavLeft,
  TopNavBrand,
  TopNavLinks,
  TopNavLink,
  TopNavSearch,
  TopNavActions,
  TopNavSearchIcon,
} from "@/components/TopNav";
import {
  DOCS_VERSION_CONFIG,
  SHOW_DOCS_VERSIONS,
} from "@/lib/versions.generated";

import "prismjs";
import "prismjs/components/prism-bash.min";
import "prismjs/components/prism-javascript.min";
import "prismjs/components/prism-typescript.min";
import "prismjs/components/prism-python.min";
import "prismjs/components/prism-json.min";
import "prismjs/components/prism-yaml.min";
import "prismjs/components/prism-css.min";
import "prismjs/components/prism-markup.min";
import "prismjs/themes/prism-tomorrow.css";

import "katex/dist/katex.min.css";

import "@/public/globals.css";

import type { AppProps } from "next/app";
import type { MarkdocNextJsPageProps } from "@markdoc/next.js";

const queryClient = new QueryClient();

const TITLE = "SysDoc";
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

// -----------------------------------------------------------------------------
// Navigation Handlers
// -----------------------------------------------------------------------------

function scrollMainToTop() {
  const mainContent = document.querySelector('[data-slot="app-layout.main"]');
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: "instant" });
  }
}

// -----------------------------------------------------------------------------
// DocsSidebar - SideNav with mobile close handling
// -----------------------------------------------------------------------------

function DocsSidebar({
  versionConfig,
}: {
  versionConfig?: typeof DOCS_VERSION_CONFIG;
}) {
  const { setSidebarOpen, isMobile } = useAppLayout();

  const handleNavigate = useCallback(() => {
    scrollMainToTop();
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen, isMobile]);

  return <SideNav versionConfig={versionConfig} onNavigate={handleNavigate} />;
}

// -----------------------------------------------------------------------------
// AppHeader - TopNav with mobile menu integration
// -----------------------------------------------------------------------------

function AppHeader() {
  const { toggleSidebar } = useAppLayout();

  return (
    <TopNav onOpenMenu={toggleSidebar}>
      <TopNavLeft>
        <TopNavMenuTrigger />
        <TopNavBrand asChild>
          <Link href="/" onClick={scrollMainToTop}>
            SysDoc
          </Link>
        </TopNavBrand>
      </TopNavLeft>
      <TopNavLinks>
        <TopNavLink asChild>
          <Link href="/docs" onClick={scrollMainToTop}>
            Docs
          </Link>
        </TopNavLink>
        <TopNavLink asChild>
          <Link href="/api-docs" onClick={scrollMainToTop}>
            API
          </Link>
        </TopNavLink>
        <TopNavSearch />
      </TopNavLinks>
      {/* Mobile actions: nav links + search icon */}
      <TopNavActions className="md:hidden">
        <TopNavLink asChild>
          <Link href="/docs" onClick={scrollMainToTop}>
            Docs
          </Link>
        </TopNavLink>
        <TopNavLink asChild>
          <Link href="/api-docs" onClick={scrollMainToTop}>
            API
          </Link>
        </TopNavLink>
        <TopNavSearchIcon />
      </TopNavActions>
    </TopNav>
  );
}

// -----------------------------------------------------------------------------
// Main App
// -----------------------------------------------------------------------------

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
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>{title}</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta name="referrer" content="strict-origin" />
          <meta name="title" content={title} />
          <meta name="description" content={description} />
          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <AppLayout>
          <AppLayout.Header>
            <AppHeader />
          </AppLayout.Header>

          <CommandDialog />

          <AppLayout.Body>
            <AppLayout.Sidebar>
              <DocsSidebar
                versionConfig={
                  SHOW_DOCS_VERSIONS ? DOCS_VERSION_CONFIG : undefined
                }
              />
            </AppLayout.Sidebar>

            <AppLayout.Main className="page-content">
              <AppLayout.MainContent>
                <Component {...pageProps} />
              </AppLayout.MainContent>
            </AppLayout.Main>

            <AppLayout.Aside>
              <TableOfContents toc={toc} />
            </AppLayout.Aside>
          </AppLayout.Body>
        </AppLayout>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
