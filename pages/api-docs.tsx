import * as React from "react";
import { useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { GetStaticProps } from "next";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import SwaggerParser from "@apidevtools/swagger-parser";

import {
  TopNav,
  TopNavBrand,
  TopNavLinks,
  TopNavLink,
  TopNavSearch,
} from "@/components/TopNav";
import {
  OpenAPILayout,
  OpenAPIHeader,
  OpenAPISidebar,
  EndpointGroup,
  Endpoint,
  ParameterTable,
  RequestBody,
  ResponseList,
} from "@/components/openapi";
import type {
  TagGroup,
  EndpointItem,
  HttpMethod,
} from "@/components/openapi/OpenAPISidebar";
import type { Parameter } from "@/components/openapi/ParameterTable";
import type { RequestBodyData } from "@/components/openapi/RequestBody";
import type { ResponsesMap } from "@/components/openapi/ResponseList";

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

interface APIDocsPageProps {
  spec: OpenAPISpec | null;
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

  // Initialize tags from spec.tags
  if (spec.tags) {
    for (const tag of spec.tags) {
      tagMap.set(tag.name, []);
      if (tag.description) {
        tagDescriptions.set(tag.name, tag.description);
      }
    }
  }

  // Build endpoint list from paths
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

  // Convert to array
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

      // Merge path-level parameters with operation parameters
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
// Page Component
// -----------------------------------------------------------------------------

export default function APIDocsPage({ spec, error }: APIDocsPageProps) {
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);

  const handleEndpointClick = useCallback((operationId: string) => {
    setActiveEndpoint(operationId);
    const element = document.getElementById(operationId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  if (error || !spec) {
    return (
      <>
        <Head>
          <title>API Documentation | Architecture</title>
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
        <div className="fixed inset-x-0 top-(--top-nav-height) bottom-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              No API Specification Found
            </h1>
            <p className="text-muted-foreground max-w-md">
              {error ??
                "Place an OpenAPI YAML file at public/openapi.yaml to generate API documentation."}
            </p>
          </div>
        </div>
      </>
    );
  }

  const tagGroups = buildTagGroups(spec);
  const operationsByTag = getOperationsByTag(spec);
  const tagDescriptions = new Map(
    spec.tags?.map((t) => [t.name, t.description]) ?? []
  );

  return (
    <>
      <Head>
        <title>{spec.info.title} API | Architecture</title>
        <meta
          name="description"
          content={spec.info.description ?? "API Documentation"}
        />
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

      <OpenAPILayout>
        <OpenAPILayout.Sidebar>
          <OpenAPISidebar
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
          />

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

export const getStaticProps: GetStaticProps<APIDocsPageProps> = async () => {
  const specPath = path.join(process.cwd(), "public", "openapi.yaml");

  // Check if file exists
  if (!fs.existsSync(specPath)) {
    return {
      props: {
        spec: null,
        error: "No openapi.yaml file found in public directory.",
      },
    };
  }

  try {
    // Read and parse YAML
    const fileContents = fs.readFileSync(specPath, "utf8");
    const rawSpec = yaml.load(fileContents) as Record<string, unknown>;

    // Validate and dereference using swagger-parser
    const api = await SwaggerParser.validate(rawSpec as any);

    // Convert to our typed format
    const spec: OpenAPISpec = {
      info: {
        title: (api as any).info?.title ?? "API",
        version: (api as any).info?.version ?? "1.0.0",
        description: (api as any).info?.description,
      },
      tags: (api as any).tags,
      paths: (api as any).paths ?? {},
    };

    return {
      props: {
        spec,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to parse OpenAPI spec";
    return {
      props: {
        spec: null,
        error: message,
      },
    };
  }
};
