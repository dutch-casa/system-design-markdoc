"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { MenuIcon } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

interface AppLayoutContextValue {
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const AppLayoutContext = React.createContext<AppLayoutContextValue | null>(
  null
);

function useAppLayout() {
  const context = React.useContext(AppLayoutContext);
  if (!context) {
    throw new Error(
      "AppLayout compound components must be used within AppLayout"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

interface RootProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  children: React.ReactNode;
  defaultSidebarOpen?: boolean;
  sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
}

function Root({
  asChild = false,
  children,
  className,
  defaultSidebarOpen = false,
  sidebarOpen: sidebarOpenProp,
  onSidebarOpenChange,
  ...props
}: RootProps) {
  const isMobile = useIsMobile();
  const [internalOpen, setInternalOpen] = React.useState(defaultSidebarOpen);

  // Controlled vs uncontrolled
  const isControlled = sidebarOpenProp !== undefined;
  const sidebarOpen = isControlled ? sidebarOpenProp : internalOpen;

  const setSidebarOpen = React.useCallback(
    (open: boolean) => {
      if (isControlled) {
        onSidebarOpenChange?.(open);
      } else {
        setInternalOpen(open);
      }
    },
    [isControlled, onSidebarOpenChange]
  );

  const toggleSidebar = React.useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  // Close sidebar when switching to desktop
  React.useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  const contextValue = React.useMemo<AppLayoutContextValue>(
    () => ({
      isMobile,
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
    }),
    [isMobile, sidebarOpen, setSidebarOpen, toggleSidebar]
  );

  const Comp = asChild ? Slot : "div";

  return (
    <AppLayoutContext.Provider value={contextValue}>
      <Comp
        data-slot="app-layout"
        data-mobile={isMobile || undefined}
        className={cn("min-h-screen", className)}
        {...props}
      >
        {children}
      </Comp>
    </AppLayoutContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------

interface HeaderProps extends React.ComponentProps<"header"> {
  asChild?: boolean;
}

function Header({ asChild = false, className, children, ...props }: HeaderProps) {
  const Comp = asChild ? Slot : "header";

  return (
    <Comp
      data-slot="app-layout.header"
      className={cn("contents", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// SidebarTrigger
// -----------------------------------------------------------------------------

interface SidebarTriggerProps extends React.ComponentProps<typeof Button> {
  asChild?: boolean;
}

function SidebarTrigger({
  asChild = false,
  className,
  children,
  ...props
}: SidebarTriggerProps) {
  const { toggleSidebar, isMobile } = useAppLayout();

  // Only render on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <Button
      data-slot="app-layout.sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("md:hidden", className)}
      onClick={toggleSidebar}
      aria-label="Toggle navigation menu"
      asChild={asChild}
      {...props}
    >
      {children ?? <MenuIcon className="size-5" />}
    </Button>
  );
}

// -----------------------------------------------------------------------------
// Sidebar
// -----------------------------------------------------------------------------

interface SidebarProps extends React.ComponentProps<"aside"> {
  asChild?: boolean;
  side?: "left" | "right";
}

function Sidebar({
  asChild = false,
  className,
  children,
  side = "left",
  ...props
}: SidebarProps) {
  const { isMobile, sidebarOpen, setSidebarOpen } = useAppLayout();

  // Mobile: render in Sheet
  if (isMobile) {
    return (
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          data-slot="app-layout.sidebar"
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
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Site navigation menu</SheetDescription>
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
      data-slot="app-layout.sidebar"
      data-state="expanded"
      className={cn(
        "hidden md:block",
        "sticky top-[var(--top-nav-height)]",
        "h-[calc(100vh-var(--top-nav-height))]",
        "w-[var(--sidebar-width)] shrink-0",
        "overflow-y-auto",
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

interface MainProps extends React.ComponentProps<"main"> {
  asChild?: boolean;
}

function Main({ asChild = false, className, children, ...props }: MainProps) {
  const Comp = asChild ? Slot : "main";

  return (
    <Comp
      data-slot="app-layout.main"
      className={cn(
        "flex-1",
        "overflow-y-auto overflow-x-hidden",
        "w-full",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// MainContent (inner wrapper for content)
// -----------------------------------------------------------------------------

interface MainContentProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MainContent({
  asChild = false,
  className,
  children,
  ...props
}: MainContentProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="app-layout.main-content"
      className={cn(
        "mx-auto max-w-[var(--content-max-width)]",
        "px-4 py-6 md:px-6 lg:px-8",
        "pb-[calc(var(--spacing-12,3rem)+100vh)]",
        "[&>h1:first-child]:mt-0",
        "[&>p:last-child]:mb-0",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// Aside (TableOfContents area)
// -----------------------------------------------------------------------------

interface AsideProps extends React.ComponentProps<"aside"> {
  asChild?: boolean;
}

function Aside({ asChild = false, className, children, ...props }: AsideProps) {
  const Comp = asChild ? Slot : "aside";

  return (
    <Comp
      data-slot="app-layout.aside"
      className={cn(
        "hidden lg:block",
        "w-[var(--toc-width)] shrink-0",
        "pr-4",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// Body (flex container for sidebar + main + aside)
// -----------------------------------------------------------------------------

interface BodyProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function Body({ asChild = false, className, children, ...props }: BodyProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="app-layout.body"
      className={cn(
        "fixed inset-x-0 bottom-0",
        "top-[var(--top-nav-height)]",
        "flex",
        "h-[calc(100vh-var(--top-nav-height))]",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// Export as compound component
// -----------------------------------------------------------------------------

export const AppLayout = Object.assign(Root, {
  Header,
  SidebarTrigger,
  Sidebar,
  Body,
  Main,
  MainContent,
  Aside,
});

export { useAppLayout };

