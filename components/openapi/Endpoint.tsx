import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Slottable } from "@/lib/polymorphic";
import { Copy, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnchorLink } from "@/components/AnchorLink";
import { METHOD_CONFIG, type HttpMethod } from "./OpenAPISidebar";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface EndpointContextValue {
  method: HttpMethod;
  path: string;
  operationId?: string;
  summary?: string;
  description?: string;
  deprecated?: boolean;
  slug: string;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const EndpointContext = createContext<EndpointContextValue | null>(null);

function useEndpointContext() {
  const context = useContext(EndpointContext);
  if (!context) {
    throw new Error(
      "Endpoint compound components must be used within Endpoint.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "article" | "section" | "div";

interface RootProps extends ComponentPropsWithoutRef<"article"> {
  as?: RootElement;
  asChild?: boolean;
  method: HttpMethod;
  path: string;
  operationId?: string;
  summary?: string;
  description?: string;
  deprecated?: boolean;
  children?: ReactNode;
}

function Root({
  as = "article",
  asChild,
  method,
  path,
  operationId,
  summary,
  description,
  deprecated = false,
  children,
  className,
  ...props
}: RootProps) {
  const slug = operationId ?? `${method}-${path.replace(/[^a-z0-9]+/gi, "-")}`;

  return (
    <EndpointContext.Provider
      value={{ method, path, operationId, summary, description, deprecated, slug }}
    >
      <Slottable
        as={as}
        asChild={asChild}
        id={slug}
        data-slot="endpoint"
        data-method={method}
        data-deprecated={deprecated || undefined}
        className={cn(
          "rounded-xl border border-border bg-card",
          "overflow-hidden scroll-mt-24",
          deprecated && "opacity-60",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <Header />
            {description && (
              <Body>
                <Description />
              </Body>
            )}
          </>
        )}
      </Slottable>
    </EndpointContext.Provider>
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
  const { method, deprecated } = useEndpointContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint.header"
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "border-b border-border",
        "bg-muted/30",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <MethodBadge />
          <Path />
          {deprecated && <DeprecatedBadge />}
          <div className="ml-auto flex items-center gap-1">
            <AnchorButton />
            <CopyButton />
          </div>
        </>
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// MethodBadge
// -----------------------------------------------------------------------------

type MethodBadgeElement = "span" | "code" | "div";

interface MethodBadgeProps extends ComponentPropsWithoutRef<"span"> {
  as?: MethodBadgeElement;
  asChild?: boolean;
}

function MethodBadge({
  as = "span",
  asChild,
  className,
  ...props
}: MethodBadgeProps) {
  const { method } = useEndpointContext();
  const config = METHOD_CONFIG[method];

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint.method-badge"
      data-method={method}
      className={cn(
        "shrink-0 rounded-md px-2 py-1",
        "text-xs font-bold uppercase tracking-wide",
        config.className,
        className
      )}
      {...props}
    >
      {config.label}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Path
// -----------------------------------------------------------------------------

type PathElement = "code" | "span" | "div";

interface PathProps extends ComponentPropsWithoutRef<"code"> {
  as?: PathElement;
  asChild?: boolean;
}

function Path({ as = "code", asChild, className, ...props }: PathProps) {
  const { path } = useEndpointContext();

  // Highlight path parameters
  const highlightedPath = path.split(/(\{[^}]+\})/g).map((part, i) => {
    if (part.startsWith("{") && part.endsWith("}")) {
      return (
        <span key={i} className="text-primary font-medium">
          {part}
        </span>
      );
    }
    return part;
  });

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint.path"
      className={cn(
        "font-mono text-sm text-foreground",
        "truncate",
        className
      )}
      {...props}
    >
      {highlightedPath}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// DeprecatedBadge
// -----------------------------------------------------------------------------

type DeprecatedBadgeElement = "span" | "div";

interface DeprecatedBadgeProps extends ComponentPropsWithoutRef<"span"> {
  as?: DeprecatedBadgeElement;
  asChild?: boolean;
}

function DeprecatedBadge({
  as = "span",
  asChild,
  className,
  ...props
}: DeprecatedBadgeProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint.deprecated-badge"
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5",
        "text-[10px] font-semibold uppercase tracking-wide",
        "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        className
      )}
      {...props}
    >
      Deprecated
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// AnchorButton
// -----------------------------------------------------------------------------

interface AnchorButtonProps extends ComponentPropsWithoutRef<"a"> {
  asChild?: boolean;
}

function AnchorButton({ asChild, className, ...props }: AnchorButtonProps) {
  const { slug, path } = useEndpointContext();

  return (
    <AnchorLink id={slug}>
      <AnchorLink.Button
        className={className}
        label={`Copy link to ${path}`}
        {...props}
      />
    </AnchorLink>
  );
}

// -----------------------------------------------------------------------------
// CopyButton
// -----------------------------------------------------------------------------

interface CopyButtonProps extends ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
}

function CopyButton({ asChild, className, ...props }: CopyButtonProps) {
  const { path } = useEndpointContext();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Slottable
      as="button"
      asChild={asChild}
      type="button"
      onClick={handleCopy}
      data-slot="endpoint.copy-button"
      data-state={copied ? "copied" : "idle"}
      className={cn(
        "shrink-0 rounded-md p-1.5",
        "text-muted-foreground",
        "transition-colors duration-150",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      aria-label={copied ? "Copied" : "Copy path"}
      {...props}
    >
      {copied ? (
        <Check className="size-4 text-emerald-500" />
      ) : (
        <Copy className="size-4" />
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Body
// -----------------------------------------------------------------------------

type BodyElement = "div" | "section";

interface BodyProps extends ComponentPropsWithoutRef<"div"> {
  as?: BodyElement;
  asChild?: boolean;
  children: ReactNode;
}

function Body({
  as = "div",
  asChild,
  children,
  className,
  ...props
}: BodyProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint.body"
      className={cn("px-4 py-4", className)}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------

type SummaryElement = "h3" | "h4" | "span" | "div";

interface SummaryProps extends ComponentPropsWithoutRef<"h3"> {
  as?: SummaryElement;
  asChild?: boolean;
}

function Summary({ as = "h3", asChild, className, ...props }: SummaryProps) {
  const { summary } = useEndpointContext();

  if (!summary) return null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint.summary"
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    >
      {summary}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Description
// -----------------------------------------------------------------------------

type DescriptionElement = "p" | "div" | "span";

interface DescriptionProps extends ComponentPropsWithoutRef<"p"> {
  as?: DescriptionElement;
  asChild?: boolean;
}

function Description({
  as = "p",
  asChild,
  className,
  ...props
}: DescriptionProps) {
  const { description } = useEndpointContext();

  if (!description) return null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint.description"
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    >
      {description}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Section (for parameters, request body, responses)
// -----------------------------------------------------------------------------

type SectionElement = "section" | "div";

interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  as?: SectionElement;
  asChild?: boolean;
  title: string;
  children: ReactNode;
}

function Section({
  as = "section",
  asChild,
  title,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint.section"
      className={cn("mt-4 first:mt-0", className)}
      {...props}
    >
      <h4
        data-slot="endpoint.section-title"
        className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {title}
      </h4>
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const Endpoint = Object.assign(Root, {
  Header,
  MethodBadge,
  Path,
  DeprecatedBadge,
  AnchorButton,
  CopyButton,
  Body,
  Summary,
  Description,
  Section,
});

export { useEndpointContext };
