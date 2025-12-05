import * as React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Slottable } from "@/lib/polymorphic";

import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface OpenAPIHeaderContextValue {
  title: string;
  version: string;
  description?: string;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const OpenAPIHeaderContext = createContext<OpenAPIHeaderContextValue | null>(
  null
);

function useOpenAPIHeaderContext() {
  const context = useContext(OpenAPIHeaderContext);
  if (!context) {
    throw new Error(
      "OpenAPIHeader compound components must be used within OpenAPIHeader.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "header" | "div" | "section";

interface RootProps extends ComponentPropsWithoutRef<"header"> {
  as?: RootElement;
  asChild?: boolean;
  title: string;
  version: string;
  description?: string;
  children?: ReactNode;
}

function Root({
  as = "header",
  asChild,
  title,
  version,
  description,
  children,
  className,
  ...props
}: RootProps) {
  return (
    <OpenAPIHeaderContext.Provider value={{ title, version, description }}>
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="openapi-header"
        className={cn("border-b border-border", "px-8 py-10", className)}
        {...props}
      >
        {children ?? (
          <>
            <div className="flex items-center gap-3">
              <Title />
              <Version />
            </div>
            {description && <Description />}
          </>
        )}
      </Slottable>
    </OpenAPIHeaderContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Title
// -----------------------------------------------------------------------------

type TitleElement = "h1" | "h2" | "span" | "div";

interface TitleProps extends ComponentPropsWithoutRef<"h1"> {
  as?: TitleElement;
  asChild?: boolean;
}

function Title({ as = "h1", asChild, className, ...props }: TitleProps) {
  const { title } = useOpenAPIHeaderContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="openapi-header.title"
      className={cn(
        "text-3xl font-bold tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {title}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Version
// -----------------------------------------------------------------------------

type VersionElement = "span" | "div" | "code";

interface VersionProps extends ComponentPropsWithoutRef<"span"> {
  as?: VersionElement;
  asChild?: boolean;
}

function Version({ as = "span", asChild, className, ...props }: VersionProps) {
  const { version } = useOpenAPIHeaderContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="openapi-header.version"
      className={cn(
        "inline-flex items-center",
        "rounded-full px-2.5 py-0.5",
        "text-xs font-medium",
        "bg-muted text-muted-foreground",
        className
      )}
      {...props}
    >
      v{version}
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
  const { description } = useOpenAPIHeaderContext();

  if (!description) return null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="openapi-header.description"
      className={cn(
        "mt-4 text-base text-muted-foreground leading-relaxed",
        "max-w-2xl",
        className
      )}
      {...props}
    >
      {description}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const OpenAPIHeader = Object.assign(Root, {
  Title,
  Version,
  Description,
});
