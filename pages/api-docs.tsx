import * as React from "react";
import { useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetStaticProps } from "next";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import SwaggerParser from "@apidevtools/swagger-parser";

import {
  TopNav,
  TopNavMenuTrigger,
  TopNavLeft,
  TopNavBrand,
  TopNavLinks,
  TopNavLink,
  TopNavSearch,
  TopNavSearchIcon,
  TopNavActions,
} from "@/components/TopNav";
import {
  OpenAPILayout,
  useOpenAPILayout,
  OpenAPIHeader,
  OpenAPISidebar,
  EndpointGroup,
  Endpoint,
  ParameterTable,
  RequestBody,
  ResponseList,
  APIVersionSwitcher,
} from "@/components/openapi";
import type {
  TagGroup,
  EndpointItem,
  HttpMethod,
} from "@/components/openapi/OpenAPISidebar";
import type { Parameter } from "@/components/openapi/ParameterTable";
import type { RequestBodyData } from "@/components/openapi/RequestBody";
import type { ResponsesMap } from "@/components/openapi/ResponseList";
import {
  getOpenAPIVersions,
  getOpenAPISpecPath,
  type Version,
  type VersionConfig,
} from "@/lib/versioning.server";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface OpenAPIInfo {
  title: string;
  version: string;
  description?: string;
}

interface OpenAPIOperation {
  operationId?: string;
  summary?: string;
  description?: string;
  deprecated?: boolean;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBodyData;
  responses?: ResponsesMap;
}

interface OpenAPIPathItem {
  get?: OpenAPIOperation;
  post?: OpenAPIOperation;
  put?: OpenAPIOperation;
  patch?: OpenAPIOperation;
  delete?: OpenAPIOperation;
  head?: OpenAPIOperation;
  options?: OpenAPIOperation;
  parameters?: Parameter[];
}

interface OpenAPITag {
  name: string;
  description?: string;
}

interface OpenAPISpec {
  info: OpenAPIInfo;
  tags?: OpenAPITag[];
  paths: Record<string, OpenAPIPathItem>;
}

interface OperationWithMeta extends OpenAPIOperation {
  method: HttpMethod;
  path: string;
}

interface VersionedSpec {
  version: string;
  spec: OpenAPISpec;
}

interface APIDocsPageProps {
  /** All available spec versions, keyed by version tag */
  specs: Record<string, OpenAPISpec>;
  /** Version configuration */
  versionConfig: VersionConfig;
  /** Error message if loading failed */
  error?: string;
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

const HTTP_METHODS: HttpMethod[] = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
];

function buildTagGroups(spec: OpenAPISpec): TagGroup[] {
  const tagMap = new Map<string, EndpointItem[]>();
  const tagDescriptions = new Map<string, string>();

  if (spec.tags) {
    for (const tag of spec.tags) {
      tagMap.set(tag.name, []);
      if (tag.description) {
        tagDescriptions.set(tag.name, tag.description);
      }
    }
  }

  for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;

      const endpoint: EndpointItem = {
        method,
        path: pathStr,
        operationId: operation.operationId,
        summary: operation.summary,
      };

      const tags = operation.tags ?? ["default"];
      for (const tag of tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(endpoint);
      }
    }
  }

  const groups: TagGroup[] = [];
  for (const [name, endpoints] of Array.from(tagMap.entries())) {
    if (endpoints.length > 0) {
      groups.push({
        name,
        description: tagDescriptions.get(name),
        endpoints,
      });
    }
  }

  return groups;
}

function getOperationsByTag(
  spec: OpenAPISpec
): Map<string, OperationWithMeta[]> {
  const tagMap = new Map<string, OperationWithMeta[]>();

  for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
    const pathParams = pathItem.parameters ?? [];

    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;

      const mergedParams = [...pathParams, ...(operation.parameters ?? [])];

      const opWithMeta: OperationWithMeta = {
        ...operation,
        method,
        path: pathStr,
        parameters: mergedParams.length > 0 ? mergedParams : undefined,
      };

      const tags = operation.tags ?? ["default"];
      for (const tag of tags) {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(opWithMeta);
      }
    }
  }

  return tagMap;
}

// -----------------------------------------------------------------------------
// Navigation Handlers
// -----------------------------------------------------------------------------

function scrollMainToTop() {
  const mainContent = document.querySelector(
    '[data-slot="openapi-layout.main"]'
  );
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: "instant" });
  }
}

// -----------------------------------------------------------------------------
// API Header with mobile menu
// -----------------------------------------------------------------------------

function APIDocsHeader() {
  const { toggleSidebar } = useOpenAPILayout();

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

// API Sidebar that closes on navigate (mobile)
function APISidebar({
  groups,
  activeEndpoint,
  onEndpointClick,
}: {
  groups: TagGroup[];
  activeEndpoint: string | null;
  onEndpointClick: (operationId: string) => void;
}) {
  const { setSidebarOpen, isMobile } = useOpenAPILayout();

  const handleNavigate = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen, isMobile]);

  return (
    <OpenAPISidebar
      groups={groups}
      activeEndpoint={activeEndpoint}
      onEndpointClick={onEndpointClick}
      onNavigate={handleNavigate}
    />
  );
}

// Simple header for error state (no layout context)
function APIDocsErrorHeader() {
  return (
    <TopNav>
      <TopNavLeft>
        <TopNavBrand asChild>
          <Link href="/">SysDoc</Link>
        </TopNavBrand>
      </TopNavLeft>
      <TopNavLinks>
        <TopNavLink asChild>
          <Link href="/docs">Docs</Link>
        </TopNavLink>
        <TopNavLink asChild>
          <Link href="/api-docs">API</Link>
        </TopNavLink>
        <TopNavSearch />
      </TopNavLinks>
      <TopNavActions className="md:hidden">
        <TopNavLink asChild>
          <Link href="/docs">Docs</Link>
        </TopNavLink>
        <TopNavLink asChild>
          <Link href="/api-docs">API</Link>
        </TopNavLink>
        <TopNavSearchIcon />
      </TopNavActions>
    </TopNav>
  );
}

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------

export default function APIDocsPage({
  specs,
  versionConfig,
  error,
}: APIDocsPageProps) {
  const router = useRouter();
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);

  // Get current version from query or default to latest
  const queryVersion =
    typeof router.query.version === "string" ? router.query.version : null;
  const currentVersion = queryVersion ?? versionConfig.current;

  // Get the spec for current version
  const spec = specs[currentVersion] ?? Object.values(specs)[0] ?? null;

  const handleEndpointClick = useCallback((operationId: string) => {
    setActiveEndpoint(operationId);
    const element = document.getElementById(operationId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleVersionChange = useCallback(
    (version: string) => {
      // Update URL with new version
      router.push(
        {
          pathname: router.pathname,
          query: { version },
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  // Error state
  if (error || !spec) {
    return (
      <>
        <Head>
          <title>API Documentation | SysDoc</title>
        </Head>
        <APIDocsErrorHeader />
        <div className="fixed inset-x-0 top-(--top-nav-height) bottom-0 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              No API Specification Found
            </h1>
            <p className="text-muted-foreground max-w-md">
              {error ??
                "Place OpenAPI YAML files in public/openapi/ (e.g., v1.yaml, v2.yaml) to generate API documentation."}
            </p>
          </div>
        </div>
      </>
    );
  }

  const tagGroups = buildTagGroups(spec);
  const operationsByTag = getOperationsByTag(spec);

  return (
    <>
      <Head>
        <title>
          {spec.info.title} API {currentVersion} | SysDoc
        </title>
        <meta
          name="description"
          content={spec.info.description ?? "API Documentation"}
        />
      </Head>

      <OpenAPILayout>
        <APIDocsHeader />

        <OpenAPILayout.Sidebar>
          <APISidebar
            groups={tagGroups}
            activeEndpoint={activeEndpoint}
            onEndpointClick={handleEndpointClick}
          />
        </OpenAPILayout.Sidebar>

        <OpenAPILayout.Main>
          <OpenAPIHeader
            title={spec.info.title}
            version={spec.info.version}
            description={spec.info.description}
          >
            <div className="flex flex-wrap items-center gap-3">
              <OpenAPIHeader.Title />
              <APIVersionSwitcher
                versions={versionConfig.versions}
                current={currentVersion}
                onVersionChange={handleVersionChange}
              />
            </div>
            <OpenAPIHeader.Description />
          </OpenAPIHeader>

          <OpenAPILayout.Content>
            <div className="flex flex-col gap-12">
              {tagGroups.map((group) => {
                const operations = operationsByTag.get(group.name) ?? [];

                return (
                  <EndpointGroup
                    key={group.name}
                    name={group.name}
                    description={group.description}
                  >
                    <EndpointGroup.Header />
                    <EndpointGroup.Content>
                      {operations.map((op) => (
                        <Endpoint
                          key={op.operationId ?? `${op.method}-${op.path}`}
                          method={op.method}
                          path={op.path}
                          operationId={op.operationId}
                          summary={op.summary}
                          description={op.description}
                          deprecated={op.deprecated}
                        >
                          <Endpoint.Header />
                          <Endpoint.Body>
                            {op.summary && <Endpoint.Summary />}
                            {op.description && <Endpoint.Description />}

                            {op.parameters && op.parameters.length > 0 && (
                              <Endpoint.Section title="Parameters">
                                <ParameterTable parameters={op.parameters} />
                              </Endpoint.Section>
                            )}

                            {op.requestBody && (
                              <Endpoint.Section title="Request Body">
                                <RequestBody data={op.requestBody} />
                              </Endpoint.Section>
                            )}

                            {op.responses &&
                              Object.keys(op.responses).length > 0 && (
                                <Endpoint.Section title="Responses">
                                  <ResponseList responses={op.responses} />
                                </Endpoint.Section>
                              )}
                          </Endpoint.Body>
                        </Endpoint>
                      ))}
                    </EndpointGroup.Content>
                  </EndpointGroup>
                );
              })}
            </div>
          </OpenAPILayout.Content>
        </OpenAPILayout.Main>
      </OpenAPILayout>
    </>
  );
}

// -----------------------------------------------------------------------------
// Static Props
// -----------------------------------------------------------------------------

async function loadSpec(specPath: string): Promise<OpenAPISpec | null> {
  if (!fs.existsSync(specPath)) {
    return null;
  }

  try {
    const fileContents = fs.readFileSync(specPath, "utf8");
    const rawSpec = yaml.load(fileContents) as Record<string, unknown>;
    const api = await SwaggerParser.validate(rawSpec as any);

    return {
      info: {
        title: (api as any).info?.title ?? "API",
        version: (api as any).info?.version ?? "1.0.0",
        description: (api as any).info?.description,
      },
      tags: (api as any).tags,
      paths: (api as any).paths ?? {},
    };
  } catch {
    return null;
  }
}

export const getStaticProps: GetStaticProps<APIDocsPageProps> = async () => {
  const versionConfig = getOpenAPIVersions();

  // No versions found
  if (versionConfig.versions.length === 0) {
    // Try legacy single file
    const legacyPath = path.join(process.cwd(), "public", "openapi.yaml");
    const legacySpec = await loadSpec(legacyPath);

    if (legacySpec) {
      return {
        props: {
          specs: { v1: legacySpec },
          versionConfig: {
            current: "v1",
            versions: [
              { tag: "v1", name: "v1.0.0", slug: "v1", isLatest: true },
            ],
          },
        },
      };
    }

    return {
      props: {
        specs: {},
        versionConfig: { current: "", versions: [] },
        error: "No OpenAPI specifications found.",
      },
    };
  }

  // Load all versioned specs
  const specs: Record<string, OpenAPISpec> = {};

  for (const version of versionConfig.versions) {
    const specPath = getOpenAPISpecPath(version.tag);
    const spec = await loadSpec(specPath);
    if (spec) {
      specs[version.tag] = spec;
    }
  }

  if (Object.keys(specs).length === 0) {
    return {
      props: {
        specs: {},
        versionConfig,
        error: "Failed to load any OpenAPI specifications.",
      },
    };
  }

  return {
    props: {
      specs,
      versionConfig,
    },
  };
};
