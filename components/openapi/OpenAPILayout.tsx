"use client";

import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Slot } from "@radix-ui/react-slot";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface OpenAPILayoutContextValue {
  sidebarWidth: string;
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const OpenAPILayoutContext = createContext<OpenAPILayoutContextValue | null>(
  null
);

export function useOpenAPILayout() {
  const context = useContext(OpenAPILayoutContext);
  if (!context) {
    throw new Error(
      "OpenAPILayout compound components must be used within OpenAPILayout"
    );
  }
  return context;
}

// Alias for backwards compatibility
export const useOpenAPILayoutContext = useOpenAPILayout;

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

interface RootProps extends ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  children: ReactNode;
  sidebarWidth?: string;
}

function Root({
  asChild = false,
  children,
  sidebarWidth = "280px",
  className,
  ...props
}: RootProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Close sidebar when switching to desktop
  React.useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  const contextValue = useMemo<OpenAPILayoutContextValue>(
    () => ({
      sidebarWidth,
      isMobile,
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
    }),
    [sidebarWidth, isMobile, sidebarOpen, toggleSidebar]
  );

  const Comp = asChild ? Slot : "div";

  return (
    <OpenAPILayoutContext.Provider value={contextValue}>
      <Comp
        data-slot="openapi-layout"
        data-mobile={isMobile || undefined}
        className={cn(
          "fixed inset-x-0 top-(--top-nav-height) bottom-0",
          "flex",
          className
        )}
        style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
        {...props}
      >
        {children}
      </Comp>
    </OpenAPILayoutContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Sidebar
// -----------------------------------------------------------------------------

interface SidebarProps extends ComponentPropsWithoutRef<"aside"> {
  asChild?: boolean;
  children: ReactNode;
  side?: "left" | "right";
}

function Sidebar({
  asChild = false,
  children,
  className,
  side = "left",
  ...props
}: SidebarProps) {
  const { isMobile, sidebarOpen, setSidebarOpen } = useOpenAPILayout();

  // Mobile: render in Sheet
  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          data-slot="openapi-layout.sidebar"
          data-state={sidebarOpen ? "open" : "closed"}
          data-mobile="true"
          side={side}
          className={cn(
            "w-[280px] p-0",
            "bg-background",
            "[&>button]:hidden",
            className
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>API Navigation</SheetTitle>
            <SheetDescription>API endpoints navigation menu</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col overflow-y-auto">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: render as aside
  const Comp = asChild ? Slot : "aside";

  return (
    <Comp
      data-slot="openapi-layout.sidebar"
      data-state="expanded"
      className={cn(
        "hidden md:block",
        "w-(--sidebar-width) shrink-0",
        "h-full overflow-y-auto",
        "border-r border-border bg-background",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

interface MainProps extends ComponentPropsWithoutRef<"main"> {
  asChild?: boolean;
  children: ReactNode;
}

function Main({
  asChild = false,
  children,
  className,
  ...props
}: MainProps) {
  const Comp = asChild ? Slot : "main";

  return (
    <Comp
      data-slot="openapi-layout.main"
      className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

interface ContentProps extends ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  children: ReactNode;
}

function Content({
  asChild = false,
  children,
  className,
  ...props
}: ContentProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="openapi-layout.content"
      className={cn(
        "mx-auto max-w-4xl",
        "px-4 py-6 md:px-8 md:py-10",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
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
