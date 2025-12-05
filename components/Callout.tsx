import * as React from "react";
import { createContext, useContext, ReactNode } from "react";
import {
  Info,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  LucideIcon,
} from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type CalloutType = "note" | "warning" | "error" | "tip";

interface TypeConfig {
  icon: LucideIcon;
  accentColor: string;
  bgColor: string;
  titleColor: string;
  iconColor: string;
  defaultTitle: string;
}

interface CalloutContextValue {
  type: CalloutType;
  config: TypeConfig;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const CalloutContext = createContext<CalloutContextValue | null>(null);

function useCalloutContext() {
  const context = useContext(CalloutContext);
  if (!context) {
    throw new Error(
      "Callout compound components must be used within Callout.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Type Configuration
// -----------------------------------------------------------------------------

const TYPE_CONFIG: Record<CalloutType, TypeConfig> = {
  note: {
    icon: Info,
    accentColor: "border-l-sky-500",
    bgColor: "bg-sky-50/50 dark:bg-sky-950/20",
    titleColor: "text-sky-900 dark:text-sky-100",
    iconColor: "text-sky-600 dark:text-sky-400",
    defaultTitle: "Note",
  },
  warning: {
    icon: AlertTriangle,
    accentColor: "border-l-amber-500",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
    titleColor: "text-amber-900 dark:text-amber-100",
    iconColor: "text-amber-600 dark:text-amber-400",
    defaultTitle: "Warning",
  },
  error: {
    icon: AlertCircle,
    accentColor: "border-l-rose-500",
    bgColor: "bg-rose-50/50 dark:bg-rose-950/20",
    titleColor: "text-rose-900 dark:text-rose-100",
    iconColor: "text-rose-600 dark:text-rose-400",
    defaultTitle: "Error",
  },
  tip: {
    icon: Lightbulb,
    accentColor: "border-l-emerald-500",
    bgColor: "bg-emerald-50/50 dark:bg-emerald-950/20",
    titleColor: "text-emerald-900 dark:text-emerald-100",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    defaultTitle: "Tip",
  },
};

// -----------------------------------------------------------------------------
// Compound Components
// -----------------------------------------------------------------------------

type RootElement = "div" | "aside" | "section";

interface RootProps {
  type?: CalloutType;
  as?: RootElement;
  asChild?: boolean;
  children: ReactNode;
}

function Root({ type = "note", as = "aside", asChild, children }: RootProps) {
  const config = TYPE_CONFIG[type];
  const Comp = asChild ? Slot : as;

  return (
    <CalloutContext.Provider value={{ type, config }}>
      <Comp
        className={`my-6 rounded-lg border-l-4 ${config.accentColor} ${config.bgColor} px-4 py-3`}
        data-slot="callout"
        data-type={type}
        role="note"
      >
        {children}
      </Comp>
    </CalloutContext.Provider>
  );
}

interface IconProps {
  asChild?: boolean;
}

function Icon({ asChild }: IconProps) {
  const { config } = useCalloutContext();
  const IconComponent = config.icon;

  if (asChild) {
    return (
      <Slot
        className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`}
        data-slot="callout.icon"
      />
    );
  }

  return (
    <IconComponent
      className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`}
      data-slot="callout.icon"
    />
  );
}

type TitleElement = "div" | "span" | "h4" | "strong";

interface TitleProps {
  as?: TitleElement;
  asChild?: boolean;
  children?: ReactNode;
}

function Title({ as = "strong", asChild, children }: TitleProps) {
  const { config } = useCalloutContext();
  const displayTitle = children ?? config.defaultTitle;
  const Comp = asChild ? Slot : as;

  return (
    <Comp
      className={`font-semibold ${config.titleColor}`}
      data-slot="callout.title"
    >
      {displayTitle}
    </Comp>
  );
}

interface ContentProps {
  asChild?: boolean;
  children: ReactNode;
}

function Content({ asChild, children }: ContentProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className="mt-1 text-sm text-muted-foreground [&>p]:m-0"
      data-slot="callout.content"
    >
      {children}
    </Comp>
  );
}

interface BodyProps {
  asChild?: boolean;
  children: ReactNode;
}

function Body({ asChild, children }: BodyProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp className="min-w-0 flex-1" data-slot="callout.body">
      {children}
    </Comp>
  );
}

// -----------------------------------------------------------------------------
// Pre-composed Default (for Markdoc)
// -----------------------------------------------------------------------------

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

function CalloutComposed({ type = "note", title, children }: CalloutProps) {
  return (
    <Root type={type}>
      <div className="flex items-start gap-3">
        <Icon />
        <Body>
          <Title>{title}</Title>
          <Content>{children}</Content>
        </Body>
      </div>
    </Root>
  );
}

// -----------------------------------------------------------------------------
// Export as namespace
// -----------------------------------------------------------------------------

export const Callout = Object.assign(CalloutComposed, {
  Root,
  Icon,
  Title,
  Content,
  Body,
});
