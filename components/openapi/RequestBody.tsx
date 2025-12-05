import * as React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Slottable } from "@/lib/polymorphic";

import { cn } from "@/lib/utils";
import { SchemaViewer } from "./SchemaViewer";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface MediaTypeContent {
  schema?: Record<string, unknown>;
  example?: unknown;
  examples?: Record<string, { value: unknown; summary?: string }>;
}

interface RequestBodyData {
  description?: string;
  required?: boolean;
  content: Record<string, MediaTypeContent>;
}

interface RequestBodyContextValue {
  data: RequestBodyData;
  activeMediaType: string;
  setActiveMediaType: (type: string) => void;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const RequestBodyContext = createContext<RequestBodyContextValue | null>(null);

function useRequestBodyContext() {
  const context = useContext(RequestBodyContext);
  if (!context) {
    throw new Error(
      "RequestBody compound components must be used within RequestBody.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "section";

interface RootProps extends ComponentPropsWithoutRef<"div"> {
  as?: RootElement;
  asChild?: boolean;
  data: RequestBodyData;
  children?: ReactNode;
}

function Root({
  as = "div",
  asChild,
  data,
  children,
  className,
  ...props
}: RootProps) {
  const mediaTypes = Object.keys(data.content);
  const [activeMediaType, setActiveMediaType] = React.useState(
    mediaTypes[0] ?? "application/json"
  );

  return (
    <RequestBodyContext.Provider
      value={{ data, activeMediaType, setActiveMediaType }}
    >
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="request-body"
        className={cn("overflow-hidden rounded-lg border border-border", className)}
        {...props}
      >
        {children ?? (
          <>
            <Header />
            <Content />
          </>
        )}
      </Slottable>
    </RequestBodyContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------

type HeaderElement = "header" | "div";

interface HeaderProps extends ComponentPropsWithoutRef<"header"> {
  as?: HeaderElement;
  asChild?: boolean;
  children?: ReactNode;
}

function Header({
  as = "header",
  asChild,
  children,
  className,
  ...props
}: HeaderProps) {
  const { data, activeMediaType, setActiveMediaType } = useRequestBodyContext();
  const mediaTypes = Object.keys(data.content);

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="request-body.header"
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-2",
        "border-b border-border bg-muted/30",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Request Body
            </span>
            {data.required && (
              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                Required
              </span>
            )}
          </div>
          {mediaTypes.length > 1 && (
            <MediaTypeSelector
              types={mediaTypes}
              active={activeMediaType}
              onSelect={setActiveMediaType}
            />
          )}
          {mediaTypes.length === 1 && (
            <code className="font-mono text-xs text-muted-foreground">
              {mediaTypes[0]}
            </code>
          )}
        </>
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// MediaTypeSelector
// -----------------------------------------------------------------------------

interface MediaTypeSelectorProps {
  types: string[];
  active: string;
  onSelect: (type: string) => void;
  className?: string;
}

function MediaTypeSelector({
  types,
  active,
  onSelect,
  className,
}: MediaTypeSelectorProps) {
  return (
    <div
      data-slot="request-body.media-type-selector"
      className={cn("flex items-center gap-1 rounded-md bg-muted p-0.5", className)}
    >
      {types.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onSelect(type)}
          data-state={type === active ? "active" : "inactive"}
          className={cn(
            "rounded px-2 py-1 font-mono text-xs",
            "transition-colors duration-150",
            "data-[state=inactive]:text-muted-foreground",
            "data-[state=inactive]:hover:text-foreground",
            "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          )}
        >
          {type.split("/")[1] ?? type}
        </button>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

type ContentElement = "div" | "section";

interface ContentProps extends ComponentPropsWithoutRef<"div"> {
  as?: ContentElement;
  asChild?: boolean;
  children?: ReactNode;
}

function Content({
  as = "div",
  asChild,
  children,
  className,
  ...props
}: ContentProps) {
  const { data, activeMediaType } = useRequestBodyContext();
  const content = data.content[activeMediaType];

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="request-body.content"
      className={cn("p-3", className)}
      {...props}
    >
      {children ?? (
        <>
          {data.description && (
            <p className="mb-3 text-sm text-muted-foreground">
              {data.description}
            </p>
          )}
          {content?.schema && (
            <SchemaViewer schema={content.schema} />
          )}
          {content?.example && (
            <div className="mt-3">
              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Example
              </h5>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
                {JSON.stringify(content.example, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const RequestBody = Object.assign(Root, {
  Header,
  MediaTypeSelector,
  Content,
});

export type { RequestBodyData, MediaTypeContent };
