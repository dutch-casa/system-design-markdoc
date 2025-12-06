import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { MenuIcon, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

type TopNavContextValue = {
  onOpenSearch: () => void;
  onOpenMenu?: () => void;
};

const TopNavContext = React.createContext<TopNavContextValue | null>(null);

function useTopNavContext() {
  const context = React.useContext(TopNavContext);
  if (!context) {
    throw new Error("TopNav compound components must be used within TopNav");
  }
  return context;
}

// -----------------------------------------------------------------------------
// TopNav Root
// -----------------------------------------------------------------------------

type TopNavProps = React.ComponentProps<"nav"> & {
  children?: React.ReactNode;
  onOpenMenu?: () => void;
};

function TopNav({ className, children, onOpenMenu, ...props }: TopNavProps) {
  const handleOpenSearch = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  }, []);

  return (
    <TopNavContext.Provider
      value={{ onOpenSearch: handleOpenSearch, onOpenMenu }}
    >
      <nav
        data-slot="top-nav"
        className={cn(
          "fixed inset-x-0 top-0 z-50",
          "flex h-[var(--top-nav-height)] items-center justify-between gap-4",
          "px-4 md:px-6",
          "bg-background/80 backdrop-blur-xl backdrop-saturate-150",
          "border-b border-border/50",
          "shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </nav>
    </TopNavContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// TopNav Menu Trigger (mobile hamburger)
// -----------------------------------------------------------------------------

type TopNavMenuTriggerProps = Omit<
  React.ComponentProps<typeof Button>,
  "children"
> & {
  asChild?: boolean;
};

function TopNavMenuTrigger({
  className,
  asChild = false,
  ...props
}: TopNavMenuTriggerProps) {
  const { onOpenMenu } = useTopNavContext();

  if (!onOpenMenu) {
    return null;
  }

  return (
    <Button
      type="button"
      data-slot="top-nav.menu-trigger"
      variant="ghost"
      size="icon"
      onClick={onOpenMenu}
      className={cn("md:hidden", className)}
      aria-label="Open navigation menu"
      asChild={asChild}
      {...props}
    >
      <MenuIcon className="size-5" />
    </Button>
  );
}

// -----------------------------------------------------------------------------
// TopNav Brand
// -----------------------------------------------------------------------------

type TopNavBrandProps = React.ComponentProps<"a"> & {
  asChild?: boolean;
};

function TopNavBrand({
  className,
  asChild = false,
  children,
  ...props
}: TopNavBrandProps) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="top-nav.brand"
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground",
        "transition-opacity duration-150 ease-out",
        "hover:opacity-70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// TopNav Left (container for menu trigger + brand)
// -----------------------------------------------------------------------------

type TopNavLeftProps = React.ComponentProps<"div">;

function TopNavLeft({ className, children, ...props }: TopNavLeftProps) {
  return (
    <div
      data-slot="top-nav.left"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// TopNav Links
// -----------------------------------------------------------------------------

type TopNavLinksProps = React.ComponentProps<"div">;

function TopNavLinks({ className, children, ...props }: TopNavLinksProps) {
  return (
    <div
      data-slot="top-nav.links"
      className={cn("hidden items-center gap-4 md:flex", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// TopNav Link
// -----------------------------------------------------------------------------

type TopNavLinkProps = React.ComponentProps<"a"> & {
  asChild?: boolean;
};

function TopNavLink({
  className,
  asChild = false,
  children,
  ...props
}: TopNavLinkProps) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="top-nav.link"
      className={cn(
        "text-sm text-muted-foreground",
        "transition-colors duration-150 ease-out",
        "hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// TopNav Search (full button with text)
// -----------------------------------------------------------------------------

type TopNavSearchProps = Omit<React.ComponentProps<"button">, "children"> & {
  shortcut?: string;
};

function TopNavSearch({
  className,
  shortcut = "⌘K",
  ...props
}: TopNavSearchProps) {
  const { onOpenSearch } = useTopNavContext();

  return (
    <button
      type="button"
      data-slot="top-nav.search"
      onClick={onOpenSearch}
      className={cn(
        "flex items-center gap-2",
        "h-9 rounded-lg px-3",
        "text-sm text-muted-foreground",
        "bg-muted/50 border border-border/50",
        "transition-all duration-150 ease-out",
        "hover:bg-muted hover:text-foreground hover:border-border",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      <SearchIcon className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">Search</span>
      <Kbd className="hidden sm:inline-flex">{shortcut}</Kbd>
    </button>
  );
}

// -----------------------------------------------------------------------------
// TopNav Search Icon (icon-only button for mobile)
// -----------------------------------------------------------------------------

type TopNavSearchIconProps = Omit<
  React.ComponentProps<typeof Button>,
  "children"
>;

function TopNavSearchIcon({ className, ...props }: TopNavSearchIconProps) {
  const { onOpenSearch } = useTopNavContext();

  return (
    <Button
      type="button"
      data-slot="top-nav.search-icon"
      variant="ghost"
      size="icon"
      onClick={onOpenSearch}
      className={cn("size-9", className)}
      aria-label="Open search"
      {...props}
    >
      <SearchIcon className="size-5" />
    </Button>
  );
}

// -----------------------------------------------------------------------------
// TopNav Actions (right-side container)
// -----------------------------------------------------------------------------

type TopNavActionsProps = React.ComponentProps<"div">;

function TopNavActions({ className, children, ...props }: TopNavActionsProps) {
  return (
    <div
      data-slot="top-nav.actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export {
  TopNav,
  TopNavMenuTrigger,
  TopNavLeft,
  TopNavBrand,
  TopNavLinks,
  TopNavLink,
  TopNavSearch,
  TopNavSearchIcon,
  TopNavActions,
};
