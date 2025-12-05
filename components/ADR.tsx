import React, {
  createContext,
  useContext,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import {
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  XCircle,
  LucideIcon,
} from "lucide-react";
import { Slottable } from "@/lib/polymorphic";
import { cn } from "@/lib/utils";
import { Link2, Check } from "lucide-react";
import { AnchorLink, useAnchorLinkContext } from "./AnchorLink";
import { DisableAnchorLinks } from "./Heading";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ADRStatus =
  | "proposed"
  | "accepted"
  | "deprecated"
  | "superseded"
  | "rejected";

interface StatusConfig {
  label: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  icon: LucideIcon;
}

interface ADRContextValue {
  id: string;
  title: string;
  status: ADRStatus;
  config: StatusConfig;
  slug: string;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const ADRContext = createContext<ADRContextValue | null>(null);

function useADRContext() {
  const context = useContext(ADRContext);
  if (!context) {
    throw new Error("ADR compound components must be used within ADR.Root");
  }
  return context;
}

// -----------------------------------------------------------------------------
// Status Configuration
// -----------------------------------------------------------------------------

const STATUS_CONFIG: Record<ADRStatus, StatusConfig> = {
  proposed: {
    label: "Proposed",
    accentColor: "border-l-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-950/40",
    textColor: "text-sky-700 dark:text-sky-300",
    icon: HelpCircle,
  },
  accepted: {
    label: "Accepted",
    accentColor: "border-l-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
    textColor: "text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle,
  },
  deprecated: {
    label: "Deprecated",
    accentColor: "border-l-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    textColor: "text-amber-700 dark:text-amber-300",
    icon: AlertTriangle,
  },
  superseded: {
    label: "Superseded",
    accentColor: "border-l-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-950/40",
    textColor: "text-violet-700 dark:text-violet-300",
    icon: RefreshCw,
  },
  rejected: {
    label: "Rejected",
    accentColor: "border-l-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/40",
    textColor: "text-rose-700 dark:text-rose-300",
    icon: XCircle,
  },
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function generateSlug(id: string, title: string): string {
  return `adr-${id}-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "section" | "article" | "div";

interface RootProps extends ComponentPropsWithoutRef<"section"> {
  id: string;
  title: string;
  status: ADRStatus;
  as?: RootElement;
  asChild?: boolean;
  children: ReactNode;
}

function Root({
  id,
  title,
  status,
  as = "section",
  asChild,
  children,
  className,
  ...props
}: RootProps) {
  const config = STATUS_CONFIG[status];
  const slug = generateSlug(id, title);

  return (
    <ADRContext.Provider value={{ id, title, status, config, slug }}>
      <Slottable
        as={as}
        asChild={asChild}
        id={slug}
        data-slot="adr"
        data-status={status}
        className={cn(
          "my-8 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm",
          config.accentColor,
          "border-l-4 scroll-mt-24",
          className
        )}
        {...props}
      >
        {children}
      </Slottable>
    </ADRContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------

type HeaderElement = "div" | "header";

interface HeaderProps extends ComponentPropsWithoutRef<"header"> {
  as?: HeaderElement;
  asChild?: boolean;
  children: ReactNode;
}

function Header({
  as = "header",
  asChild,
  children,
  className,
  ...props
}: HeaderProps) {
  const { config } = useADRContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="adr.header"
      className={cn(config.bgColor, "px-5 py-4", className)}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Icon
// -----------------------------------------------------------------------------

type IconElement = "div" | "span";

interface IconProps extends ComponentPropsWithoutRef<"div"> {
  as?: IconElement;
  asChild?: boolean;
}

function Icon({ as = "div", asChild, className, ...props }: IconProps) {
  const { config } = useADRContext();
  const IconComponent = config.icon;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="adr.icon"
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
        config.bgColor,
        "ring-1 ring-inset ring-current/10",
        config.textColor,
        className
      )}
      {...props}
    >
      <IconComponent className="h-5 w-5" strokeWidth={1.5} />
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Title
// -----------------------------------------------------------------------------

type TitleElement = "div" | "span";

interface TitleProps extends ComponentPropsWithoutRef<"div"> {
  as?: TitleElement;
  asChild?: boolean;
}

function ADRTitleContent({ id, title }: { id: string; title: string }) {
  const { handleClick, href, copied } = useAnchorLinkContext();

  return (
    <>
      <div className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
        ADR-{id}
      </div>
      <a
        href={href}
        onClick={handleClick}
        aria-label={`Link to ADR-${id}: ${title}`}
        className={cn(
          "mt-0.5 flex items-baseline gap-2",
          "text-lg font-semibold leading-tight tracking-tight text-foreground",
          "no-underline hover:text-foreground cursor-pointer"
        )}
      >
        <span>{title}</span>
        <span
          data-slot="anchor-link.inline"
          data-state={copied ? "copied" : "idle"}
          className={cn(
            "inline-flex items-center self-center",
            "text-muted-foreground/0 group-hover/adr-title:text-muted-foreground",
            "transition-colors duration-base ease-out-cubic",
            "hover:text-foreground"
          )}
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : (
            <Link2 className="size-3.5" />
          )}
        </span>
      </a>
    </>
  );
}

function Title({ as = "div", asChild, className, ...props }: TitleProps) {
  const { id, title, slug } = useADRContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="adr.title"
      className={cn("group/adr-title min-w-0", className)}
      {...props}
    >
      <AnchorLink id={slug}>
        <ADRTitleContent id={id} title={title} />
      </AnchorLink>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Badge
// -----------------------------------------------------------------------------

type BadgeElement = "span" | "div";

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  as?: BadgeElement;
  asChild?: boolean;
}

function Badge({ as = "span", asChild, className, ...props }: BadgeProps) {
  const { config } = useADRContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="adr.badge"
      className={cn(
        "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "text-xs font-semibold ring-1 ring-inset ring-current/20",
        config.bgColor,
        config.textColor,
        className
      )}
      {...props}
    >
      {config.label}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Metadata
// -----------------------------------------------------------------------------

type MetadataElement = "div" | "dl" | "ul";

interface MetadataProps extends ComponentPropsWithoutRef<"div"> {
  as?: MetadataElement;
  asChild?: boolean;
  children: ReactNode;
}

function Metadata({
  as = "div",
  asChild,
  children,
  className,
  ...props
}: MetadataProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="adr.metadata"
      className={cn(
        "mt-4 flex flex-wrap items-center gap-x-5 gap-y-2",
        "border-t border-current/5 pt-3 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// MetadataItem
// -----------------------------------------------------------------------------

type MetadataItemElement = "div" | "span";

interface MetadataItemProps extends ComponentPropsWithoutRef<"div"> {
  label: string;
  value: string;
  mono?: boolean;
  as?: MetadataItemElement;
  asChild?: boolean;
}

function MetadataItem({
  label,
  value,
  mono = false,
  as = "div",
  asChild,
  className,
  ...props
}: MetadataItemProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="adr.metadata-item"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      <span className="text-muted-foreground/70">{label}:</span>
      <span
        className={cn(
          "font-medium text-foreground",
          mono && "font-mono text-xs"
        )}
      >
        {value}
      </span>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

type ContentElement = "div" | "article";

interface ContentProps extends ComponentPropsWithoutRef<"article"> {
  as?: ContentElement;
  asChild?: boolean;
  children: ReactNode;
}

function Content({
  as = "article",
  asChild,
  children,
  className,
  ...props
}: ContentProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="adr.content"
      className={cn("px-5 py-5", className)}
      {...props}
    >
      <DisableAnchorLinks>
        <div
          className={cn(
            "text-sm text-foreground/80 leading-relaxed",
            // Style bold text as section labels (standalone <p><strong>Label</strong></p>)
            "[&_p:has(>strong:only-child)]:mt-4 [&_p:has(>strong:only-child)]:mb-1.5 [&_p:has(>strong:only-child)]:text-[11px] [&_p:has(>strong:only-child)]:font-semibold [&_p:has(>strong:only-child)]:uppercase [&_p:has(>strong:only-child)]:tracking-wider [&_p:has(>strong:only-child)]:text-muted-foreground",
            "[&_p:has(>strong:only-child):first-child]:mt-0",
            // Prose-like defaults
            "[&_p]:my-2 [&_p]:leading-relaxed",
            "[&_ul]:my-2 [&_ul]:pl-4 [&_ul]:list-disc",
            "[&_ol]:my-2 [&_ol]:pl-4 [&_ol]:list-decimal",
            "[&_li]:my-1",
            "[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
            // Inner headings: smaller, tighter spacing, underlined
            "[&_.heading]:text-sm [&_.heading]:font-semibold [&_.heading]:mt-4 [&_.heading]:mb-1.5",
            "[&_.heading]:underline [&_.heading]:underline-offset-2 [&_.heading]:decoration-muted-foreground/40",
            "[&_.heading:first-child]:mt-0",
            "[&_h2.heading]:text-base [&_h3.heading]:text-sm [&_h4.heading]:text-sm"
          )}
        >
          {children}
        </div>
      </DisableAnchorLinks>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Pre-composed Default (for Markdoc)
// -----------------------------------------------------------------------------

interface ADRProps {
  id: string;
  title: string;
  status: ADRStatus;
  date: string;
  deciders?: string;
  supersedes?: string;
  supersededBy?: string;
  children: ReactNode;
}

function ADRComposed({
  id,
  title,
  status,
  date,
  deciders,
  supersedes,
  supersededBy,
  children,
}: ADRProps) {
  return (
    <Root id={id} title={title} status={status}>
      <Header>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon />
            <Title />
          </div>
          <Badge />
        </div>
        <Metadata>
          <MetadataItem label="Date" value={date} />
          {deciders && <MetadataItem label="Deciders" value={deciders} />}
          {supersedes && (
            <MetadataItem label="Supersedes" value={`ADR-${supersedes}`} mono />
          )}
          {supersededBy && (
            <MetadataItem
              label="Superseded by"
              value={`ADR-${supersededBy}`}
              mono
            />
          )}
        </Metadata>
      </Header>
      <Content>{children}</Content>
    </Root>
  );
}

// -----------------------------------------------------------------------------
// Export as namespace
// -----------------------------------------------------------------------------

export const ADR = Object.assign(ADRComposed, {
  Root,
  Header,
  Icon,
  Title,
  Badge,
  Metadata,
  MetadataItem,
  Content,
  displayName: "ADR" as const,
});
