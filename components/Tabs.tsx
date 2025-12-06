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
  // If no defaultValue, try to get it from first tab child
  const firstTabValue = React.useMemo(() => {
    if (defaultValue) return defaultValue;
    const childArray = React.Children.toArray(children);
    const firstTab = childArray.find(
      (child): child is React.ReactElement =>
        React.isValidElement(child) && (child.props as any).label
    );
    if (firstTab) {
      const label = (firstTab.props as any).label || "";
      return label.toLowerCase().replace(/\s+/g, "-");
    }
    return "";
  }, [defaultValue, children]);

  const [activeTab, setActiveTab] = useState(firstTabValue);

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
  label,
  children,
  className,
  ...props
}: ContentProps & { label?: string }) {
  const { activeTab } = useTabsContext();
  // Generate value from label if not provided
  const tabValue =
    value || (label ? label.toLowerCase().replace(/\s+/g, "-") : "");
  const isActive = activeTab === tabValue;

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
  const tabs = React.Children.toArray(children).filter(
    (child): child is React.ReactElement => React.isValidElement(child)
  );

  const tabsWithValues = tabs.map((tab) => {
    const label = (tab.props as any).label || "";
    const value =
      (tab.props as any).value || label.toLowerCase().replace(/\s+/g, "-");
    const tabChildren = (tab.props as any).children;
    return { label, value, children: tabChildren };
  });

  const firstValue = tabsWithValues.length > 0 ? tabsWithValues[0].value : "";

  return (
    <Root defaultValue={firstValue}>
      <List>
        {tabsWithValues.map(({ label, value }) => (
          <Trigger key={value} value={value}>
            {label}
          </Trigger>
        ))}
      </List>
      {tabsWithValues.map(({ value, label, children: tabChildren }) => (
        <Content key={value} value={value} label={label}>
          {tabChildren}
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
