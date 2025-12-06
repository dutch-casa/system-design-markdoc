import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Slottable, AsChildProps } from "@/lib/polymorphic";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compound components must be used within Tabs.Root");
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "section";

interface RootOwnProps extends AsChildProps {
  as?: RootElement;
  defaultValue?: string;
  children: ReactNode;
}

type RootProps<T extends React.ElementType = "div"> = RootOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof RootOwnProps>;

function Root({
  as = "div",
  asChild,
  defaultValue,
  children,
  className,
  ...props
}: RootProps) {
  const [activeTab, setActiveTab] = useState(defaultValue ?? "");

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="tabs"
        className={cn("my-6", className)}
        {...props}
      >
        {children}
      </Slottable>
    </TabsContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// List
// -----------------------------------------------------------------------------

type ListElement = "div" | "nav";

interface ListOwnProps extends AsChildProps {
  as?: ListElement;
  children: ReactNode;
}

type ListProps<T extends React.ElementType = "div"> = ListOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof ListOwnProps>;

function List({
  as = "div",
  asChild,
  children,
  className,
  ...props
}: ListProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="tabs.list"
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-border bg-muted/30 p-1 rounded-t-lg",
        className
      )}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Trigger
// -----------------------------------------------------------------------------

type TriggerElement = "button";

interface TriggerOwnProps extends AsChildProps {
  value: string;
  children: ReactNode;
}

type TriggerProps = TriggerOwnProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof TriggerOwnProps>;

function Trigger({
  asChild,
  value,
  children,
  className,
  ...props
}: TriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <Slottable
      as="button"
      asChild={asChild}
      type="button"
      role="tab"
      aria-selected={isActive}
      data-slot="tabs.trigger"
      data-state={isActive ? "active" : "inactive"}
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-md",
        "transition-colors duration-base ease-out-cubic",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Content
// -----------------------------------------------------------------------------

type ContentElement = "div";

interface ContentOwnProps extends AsChildProps {
  value: string;
  children: ReactNode;
}

type ContentProps = ContentOwnProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof ContentOwnProps>;

function Content({
  asChild,
  value,
  children,
  className,
  ...props
}: ContentProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <Slottable
      as="div"
      asChild={asChild}
      role="tabpanel"
      data-slot="tabs.content"
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "rounded-b-lg border border-t-0 border-border bg-card p-4",
        className
      )}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Pre-composed Default (for Markdoc)
// -----------------------------------------------------------------------------

interface TabsProps {
  children: ReactNode;
}

function TabsComposed({ children }: TabsProps) {
  // Extract tabs from children to auto-generate IDs
  const childArray = React.Children.toArray(children);
  const firstTabId = childArray.length > 0 ? `tab-0` : "";

  return (
    <Root defaultValue={firstTabId}>
      <List>
        {childArray.map((_, index) => (
          <Trigger key={`trigger-${index}`} value={`tab-${index}`}>
            Tab {index + 1}
          </Trigger>
        ))}
      </List>
      {childArray.map((child, index) => (
        <Content key={`content-${index}`} value={`tab-${index}`}>
          {child}
        </Content>
      ))}
    </Root>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const Tabs = Object.assign(TabsComposed, {
  Root,
  List,
  Trigger,
  Content,
});
