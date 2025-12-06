/**
 * APIVersionSwitcher
 *
 * Version switcher specifically designed for OpenAPI documentation.
 * Integrates seamlessly with the OpenAPI header layout.
 *
 * @example
 * <APIVersionSwitcher
 *   versions={versions}
 *   current="v2"
 *   onVersionChange={(v) => router.push(`/api-docs?version=${v}`)}
 * />
 */

import * as React from "react";
import { createContext, useContext, useCallback } from "react";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";
import type { Version } from "@/lib/versioning";

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

interface APIVersionContextValue {
  versions: Version[];
  current: string;
  onVersionChange: (version: string) => void;
}

const APIVersionContext = createContext<APIVersionContextValue | null>(null);

function useAPIVersionContext() {
  const context = useContext(APIVersionContext);
  if (!context) {
    throw new Error(
      "APIVersionSwitcher compound components must be used within APIVersionSwitcher"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

interface RootProps {
  versions: Version[];
  current: string;
  onVersionChange: (version: string) => void;
  children?: React.ReactNode;
  className?: string;
}

function Root({
  versions,
  current,
  onVersionChange,
  children,
  className,
}: RootProps) {
  const handleValueChange = useCallback(
    (value: string) => {
      if (value !== current) {
        onVersionChange(value);
      }
    },
    [current, onVersionChange]
  );

  // Single version or no versions - show static badge
  if (versions.length <= 1) {
    const version = versions[0];
    return (
      <div
        data-slot="api-version"
        className={cn(
          "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground",
          className
        )}
      >
        {version?.name ?? current ?? "v1"}
      </div>
    );
  }

  return (
    <APIVersionContext.Provider value={{ versions, current, onVersionChange }}>
      <SelectPrimitive.Root value={current} onValueChange={handleValueChange}>
        <div
          data-slot="api-version-switcher"
          className={cn("relative inline-flex", className)}
        >
          {children ?? (
            <>
              <Trigger />
              <Content />
            </>
          )}
        </div>
      </SelectPrimitive.Root>
    </APIVersionContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Trigger
// -----------------------------------------------------------------------------

interface TriggerProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    "asChild"
  > {}

function Trigger({ className, ...props }: TriggerProps) {
  const { versions, current } = useAPIVersionContext();
  const currentVersion = versions.find((v) => v.tag === current);

  return (
    <SelectPrimitive.Trigger
      data-slot="api-version-switcher.trigger"
      className={cn(
        // Base - pill/badge style to match OpenAPI header aesthetic
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
        // Colors
        "bg-muted text-muted-foreground",
        // Typography
        "text-xs font-medium",
        // States
        "transition-colors duration-150 ease-out",
        "hover:bg-muted/80 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        className
      )}
      {...props}
    >
      <span>{currentVersion?.name ?? `v${current}`}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-3 opacity-60" aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

interface ContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

function Content({
  className,
  position = "popper",
  align = "start",
  sideOffset = 4,
  ...props
}: ContentProps) {
  const { versions } = useAPIVersionContext();

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="api-version-switcher.content"
        position={position}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          // Base
          "relative z-50 min-w-[10rem] overflow-hidden rounded-lg border border-border bg-popover shadow-lg",
          // Animation
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {versions.map((version) => (
            <Item key={version.tag} version={version} />
          ))}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// -----------------------------------------------------------------------------
// Item
// -----------------------------------------------------------------------------

interface ItemProps {
  version: Version;
  className?: string;
}

function Item({ version, className }: ItemProps) {
  return (
    <SelectPrimitive.Item
      data-slot="api-version-switcher.item"
      value={version.tag}
      className={cn(
        // Base layout
        "relative flex cursor-pointer select-none items-center rounded-md py-1.5 pl-2 pr-7 text-sm outline-none",
        // Colors and states
        "text-foreground/80",
        "focus:bg-accent focus:text-accent-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{version.name}</span>
        {version.isLatest && (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            Latest
          </span>
        )}
      </div>
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-3.5" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const APIVersionSwitcher = Object.assign(Root, {
  Trigger,
  Content,
  Item,
});
