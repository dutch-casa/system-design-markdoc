import * as React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Quote as QuoteIcon } from "lucide-react";
import { Slottable, AsChildProps } from "@/lib/polymorphic";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface QuoteContextValue {
  author?: string;
  source?: string;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const QuoteContext = createContext<QuoteContextValue | null>(null);

function useQuoteContext() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("Quote compound components must be used within Quote.Root");
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "blockquote" | "div";

interface RootOwnProps extends AsChildProps {
  as?: RootElement;
  author?: string;
  source?: string;
  children: ReactNode;
}

type RootProps<T extends React.ElementType = "blockquote"> = RootOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof RootOwnProps>;

function Root({
  as = "blockquote",
  asChild,
  author,
  source,
  children,
  className,
  ...props
}: RootProps) {
  return (
    <QuoteContext.Provider value={{ author, source }}>
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="quote"
        className={cn(
          "my-6 border-l-4 border-primary bg-muted/30 p-6 not-italic",
          className
        )}
        {...props}
      >
        {children}
      </Slottable>
    </QuoteContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Text
// -----------------------------------------------------------------------------

type TextElement = "p" | "div";

interface TextOwnProps extends AsChildProps {
  as?: TextElement;
  children: ReactNode;
}

type TextProps<T extends React.ElementType = "p"> = TextOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof TextOwnProps>;

function Text({ as = "p", asChild, children, className, ...props }: TextProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="quote.text"
      className={cn(
        "relative text-lg leading-relaxed text-foreground",
        'before:absolute before:-left-2 before:-top-1 before:text-4xl before:text-primary/20 before:content-[\'"\']',
        className
      )}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Attribution
// -----------------------------------------------------------------------------

type AttributionElement = "footer" | "cite" | "div";

interface AttributionOwnProps extends AsChildProps {
  as?: AttributionElement;
}

type AttributionProps<T extends React.ElementType = "footer"> =
  AttributionOwnProps &
    Omit<ComponentPropsWithoutRef<T>, keyof AttributionOwnProps>;

function Attribution({
  as = "footer",
  asChild,
  className,
  ...props
}: AttributionProps) {
  const { author, source } = useQuoteContext();

  if (!author && !source) return null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="quote.attribution"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    >
      <div>
        {author && <span className="font-medium">— {author}</span>}
        {author && source && <span>, </span>}
        {source && <cite className="not-italic">{source}</cite>}
      </div>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Pre-composed Default (for Markdoc)
// -----------------------------------------------------------------------------

interface QuoteProps {
  author?: string;
  source?: string;
  children: ReactNode;
}

function QuoteComposed({ author, source, children }: QuoteProps) {
  return (
    <Root author={author} source={source}>
      <Text>{children}</Text>
      <Attribution />
    </Root>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const Quote = Object.assign(QuoteComposed, {
  Root,
  Text,
  Attribution,
});

