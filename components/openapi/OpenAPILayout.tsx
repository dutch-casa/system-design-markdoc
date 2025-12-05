import * as React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  ElementType,
  ComponentPropsWithoutRef,
} from "react";
import { Slottable } from "@/lib/polymorphic";

import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface OpenAPILayoutContextValue {
  sidebarWidth: string;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const OpenAPILayoutContext = createContext<OpenAPILayoutContextValue | null>(
  null
);

export function useOpenAPILayoutContext() {
  const context = useContext(OpenAPILayoutContext);
  if (!context) {
    throw new Error(
      "OpenAPILayout compound components must be used within OpenAPILayout.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "section";

interface RootProps {
  as?: RootElement;
  asChild?: boolean;
  children: ReactNode;
  sidebarWidth?: string;
  className?: string;
}

function Root({
  as = "div",
  asChild,
  children,
  sidebarWidth = "280px",
  className,
}: RootProps) {
  return (
    <OpenAPILayoutContext.Provider value={{ sidebarWidth }}>
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="openapi-layout"
        className={cn(
          "fixed inset-x-0 top-(--top-nav-height) bottom-0",
          "flex",
          className
        )}
        style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
      >
        {children}
      </Slottable>
    </OpenAPILayoutContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Sidebar
// -----------------------------------------------------------------------------

type SidebarElement = "aside" | "nav" | "div";

interface SidebarProps extends ComponentPropsWithoutRef<"aside"> {
  as?: SidebarElement;
  asChild?: boolean;
  children: ReactNode;
}

function Sidebar({
  as = "aside",
  asChild,
  children,
  className,
  ...props
}: SidebarProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="openapi-layout.sidebar"
      className={cn(
        "w-[var(--sidebar-width)] shrink-0",
        "h-full overflow-y-auto",
        "border-r border-border bg-background",
        className
      )}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

type MainElement = "main" | "div" | "article";

interface MainProps extends ComponentPropsWithoutRef<"main"> {
  as?: MainElement;
  asChild?: boolean;
  children: ReactNode;
}

function Main({ as = "main", asChild, children, className, ...props }: MainProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="openapi-layout.main"
      className={cn("flex-1 overflow-y-auto", className)}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

type ContentElement = "div" | "article" | "section";

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
      data-slot="openapi-layout.content"
      className={cn("mx-auto max-w-4xl", "px-8 py-10", className)}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const OpenAPILayout = Object.assign(Root, {
  Sidebar,
  Main,
  Content,
});
