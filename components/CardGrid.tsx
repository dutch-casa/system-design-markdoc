import * as React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import * as LucideIcons from "lucide-react";
import { Slottable, AsChildProps } from "@/lib/polymorphic";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CardGridContextValue {}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const CardGridContext = createContext<CardGridContextValue | null>(null);

function useCardGridContext() {
  const context = useContext(CardGridContext);
  if (!context) {
    throw new Error(
      "CardGrid compound components must be used within CardGrid.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "section";

interface RootOwnProps extends AsChildProps {
  as?: RootElement;
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

type RootProps<T extends React.ElementType = "div"> = RootOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof RootOwnProps>;

function Root({
  as = "div",
  asChild,
  children,
  columns = 3,
  className,
  ...props
}: RootProps) {
  return (
    <CardGridContext.Provider value={{}}>
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="cardgrid"
        className={cn(
          "my-6 grid gap-4",
          columns === 2 && "grid-cols-1 md:grid-cols-2",
          columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          className
        )}
        {...props}
      >
        {children}
      </Slottable>
    </CardGridContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Card
// -----------------------------------------------------------------------------

type CardElement = "div" | "article";

interface CardOwnProps extends AsChildProps {
  as?: CardElement;
  icon?: string;
  title?: string;
  children: ReactNode;
}

type CardProps<T extends React.ElementType = "div"> = CardOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof CardOwnProps>;

function Card({
  as = "div",
  asChild,
  icon,
  title,
  children,
  className,
  ...props
}: CardProps) {
  // Get icon component from lucide-react
  const IconComponent = icon
    ? (LucideIcons as any)[icon] ?? LucideIcons.FileText
    : null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="cardgrid.card"
      className={cn(
        "rounded-lg border border-border bg-card p-6",
        "transition-shadow duration-base ease-out-cubic",
        "hover:shadow-md",
        className
      )}
      {...props}
    >
      <div>
        {IconComponent && (
          <div
            data-slot="cardgrid.icon"
            className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
          >
            <IconComponent className="size-5" />
          </div>
        )}
        {title && (
          <h3
            data-slot="cardgrid.title"
            className="mb-2 text-lg font-semibold text-foreground"
          >
            {title}
          </h3>
        )}
        <div
          data-slot="cardgrid.description"
          className="text-sm text-muted-foreground"
        >
          {children}
        </div>
      </div>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Pre-composed Default (for Markdoc)
// -----------------------------------------------------------------------------

interface CardGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

function CardGridComposed({ children, columns = 3 }: CardGridProps) {
  return <Root columns={columns}>{children}</Root>;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const CardGrid = Object.assign(CardGridComposed, {
  Root,
  Card,
});

