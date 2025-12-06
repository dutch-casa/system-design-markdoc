/**
 * VersionSwitcher
 *
 * A compound component for switching between documentation versions.
 * Built on Radix Select primitives with compound component pattern.
 *
 * @example
 * // Simple usage with defaults
 * <VersionSwitcher versions={versions} current="v2.0.0" onVersionChange={handleChange} />
 *
 * @example
 * // Compound usage for customization
 * <VersionSwitcher versions={versions} current="v2.0.0" onVersionChange={handleChange}>
 *   <VersionSwitcher.Trigger size="sm" />
 *   <VersionSwitcher.Content align="start">
 *     <VersionSwitcher.Items />
 *   </VersionSwitcher.Content>
 * </VersionSwitcher>
 */

import * as React from "react";
import { createContext, useContext, useCallback } from "react";
import { ChevronDownIcon, CheckIcon, TagIcon } from "lucide-react";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "@/lib/utils";
import { Slottable } from "@/lib/polymorphic";
import type { Version } from "@/lib/versioning";

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

interface VersionSwitcherContextValue {
  versions: Version[];
  current: string;
  onVersionChange: (version: string) => void;
}

const VersionSwitcherContext =
  createContext<VersionSwitcherContextValue | null>(null);

function useVersionSwitcherContext() {
  const context = useContext(VersionSwitcherContext);
  if (!context) {
    throw new Error(
      "VersionSwitcher compound components must be used within VersionSwitcher"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

interface RootProps {
  /** Available versions */
  versions: Version[];
  /** Currently selected version tag */
  current: string;
  /** Callback when version changes */
  onVersionChange: (version: string) => void;
  /** Custom children for compound pattern, or omit for default UI */
  children?: React.ReactNode;
  /** Additional className for the root container */
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

  // If no versions or only one version, don't render switcher
  if (versions.length <= 1) {
    return null;
  }

  const currentVersion = versions.find((v) => v.tag === current);

  return (
    <VersionSwitcherContext.Provider
      value={{ versions, current, onVersionChange }}
    >
      <SelectPrimitive.Root value={current} onValueChange={handleValueChange}>
        <div
          data-slot="version-switcher"
          className={cn("relative", className)}
        >
          {children ?? (
            <>
              <Trigger />
              <Content>
                <Items />
              </Content>
            </>
          )}
        </div>
      </SelectPrimitive.Root>
    </VersionSwitcherContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Trigger
// -----------------------------------------------------------------------------

type TriggerElement = "button";

interface TriggerProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    "asChild"
  > {
  as?: TriggerElement;
  asChild?: boolean;
  size?: "sm" | "default";
  /** Show icon before version label */
  showIcon?: boolean;
}

function Trigger({
  className,
  size = "default",
  showIcon = true,
  ...props
}: TriggerProps) {
  const { versions, current } = useVersionSwitcherContext();
  const currentVersion = versions.find((v) => v.tag === current);

  return (
    <SelectPrimitive.Trigger
      data-slot="version-switcher.trigger"
      data-size={size}
      className={cn(
        // Base layout
        "flex w-full items-center justify-between gap-2",
        // Sizing
        "rounded-lg border border-border bg-muted/50 px-3",
        size === "default" && "h-9 text-sm",
        size === "sm" && "h-8 text-xs",
        // Colors
        "text-foreground/80",
        // States
        "transition-colors duration-150 ease-out",
        "hover:bg-muted hover:border-border/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2 truncate">
        {showIcon && (
          <TagIcon
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <span className="truncate font-medium">
          {currentVersion?.name ?? current}
        </span>
        {currentVersion?.isLatest && (
          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            Latest
          </span>
        )}
      </span>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

interface ContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  children?: React.ReactNode;
}

function Content({
  className,
  children,
  position = "popper",
  align = "start",
  sideOffset = 4,
  ...props
}: ContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="version-switcher.content"
        position={position}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          // Base
          "relative z-50 min-w-[12rem] overflow-hidden rounded-lg border border-border bg-popover shadow-lg",
          // Animation
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=top]:slide-in-from-bottom-2",
          // Popper positioning
          position === "popper" &&
            "max-h-[var(--radix-select-content-available-height)]",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children ?? <Items />}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// -----------------------------------------------------------------------------
// Items
// -----------------------------------------------------------------------------

interface ItemsProps {
  className?: string;
}

function Items({ className }: ItemsProps) {
  const { versions } = useVersionSwitcherContext();

  return (
    <div data-slot="version-switcher.items" className={cn("space-y-0.5", className)}>
      {versions.map((version) => (
        <Item key={version.tag} version={version} />
      ))}
    </div>
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
      data-slot="version-switcher.item"
      value={version.tag}
      className={cn(
        // Base layout
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md py-2 pl-2 pr-8 text-sm outline-none",
        // Colors and states
        "text-foreground/80",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium">{version.name}</span>
          {version.isLatest && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Latest
            </span>
          )}
        </div>
        {version.date && (
          <span className="text-xs text-muted-foreground">{version.date}</span>
        )}
      </div>
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

// -----------------------------------------------------------------------------
// Label (optional header)
// -----------------------------------------------------------------------------

interface LabelProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

function Label({ className, children, ...props }: LabelProps) {
  return (
    <div
      data-slot="version-switcher.label"
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground",
        className
      )}
      {...props}
    >
      {children ?? "Version"}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Separator
// -----------------------------------------------------------------------------

function Separator({ className }: { className?: string }) {
  return (
    <SelectPrimitive.Separator
      data-slot="version-switcher.separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
    />
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const VersionSwitcher = Object.assign(Root, {
  Trigger,
  Content,
  Items,
  Item,
  Label,
  Separator,
});

export type { Version };
