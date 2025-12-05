import * as React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Link2, Check } from "lucide-react";
import { Slottable } from "@/lib/polymorphic";

import { cn } from "@/lib/utils";
import { AnchorLink, useAnchorLinkContext } from "@/components/AnchorLink";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface EndpointGroupContextValue {
  name: string;
  description?: string;
  slug: string;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const EndpointGroupContext = createContext<EndpointGroupContextValue | null>(
  null
);

function useEndpointGroupContext() {
  const context = useContext(EndpointGroupContext);
  if (!context) {
    throw new Error(
      "EndpointGroup compound components must be used within EndpointGroup.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "section" | "div" | "article";

interface RootProps extends ComponentPropsWithoutRef<"section"> {
  as?: RootElement;
  asChild?: boolean;
  name: string;
  description?: string;
  children: ReactNode;
}

function Root({
  as = "section",
  asChild,
  name,
  description,
  children,
  className,
  ...props
}: RootProps) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <EndpointGroupContext.Provider value={{ name, description, slug }}>
      <Slottable
        as={as}
        asChild={asChild}
        id={slug}
        data-slot="endpoint-group"
        className={cn("scroll-mt-24", className)}
        {...props}
      >
        {children}
      </Slottable>
    </EndpointGroupContext.Provider>
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
  const { name, description } = useEndpointGroupContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint-group.header"
      className={cn("mb-6 border-b border-border pb-4", className)}
      {...props}
    >
      {children ?? (
        <>
          <Title />
          {description && <Description />}
        </>
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Title
// -----------------------------------------------------------------------------

type TitleElement = "h2" | "h3" | "h4" | "span" | "div";

interface TitleProps extends ComponentPropsWithoutRef<"h2"> {
  as?: TitleElement;
  asChild?: boolean;
}

function EndpointGroupTitleContent({ name }: { name: string }) {
  const { handleClick, href, copied } = useAnchorLinkContext();

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-label={`Link to ${name}`}
      className={cn(
        "inline-flex items-baseline gap-2",
        "text-inherit no-underline hover:text-inherit cursor-pointer"
      )}
    >
      <span>{name}</span>
      <span
        data-slot="anchor-link.inline"
        data-state={copied ? "copied" : "idle"}
        className={cn(
          "inline-flex items-center self-center",
          "text-muted-foreground/0 group-hover/title:text-muted-foreground",
          "transition-colors duration-base ease-out-cubic",
          "hover:text-foreground"
        )}
      >
        {copied ? (
          <Check className="size-4 text-emerald-500" />
        ) : (
          <Link2 className="size-4" />
        )}
      </span>
    </a>
  );
}

function Title({ as = "h2", asChild, className, ...props }: TitleProps) {
  const { name, slug } = useEndpointGroupContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint-group.title"
      className={cn(
        "group/title text-xl font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      <AnchorLink id={slug}>
        <EndpointGroupTitleContent name={name} />
      </AnchorLink>
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
  const { description } = useEndpointGroupContext();

  if (!description) return null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint-group.description"
      className={cn("mt-2 text-sm text-muted-foreground", className)}
      {...props}
    >
      {description}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

type ContentElement = "div" | "article";

interface ContentProps extends ComponentPropsWithoutRef<"div"> {
  as?: ContentElement;
  asChild?: boolean;
  children: ReactNode;
}

function Content({
  as = "div",
  asChild,
  children,
  className,
  ...props
}: ContentProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="endpoint-group.content"
      className={cn("flex flex-col gap-8", className)}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const EndpointGroup = Object.assign(Root, {
  Header,
  Title,
  Description,
  Content,
});
