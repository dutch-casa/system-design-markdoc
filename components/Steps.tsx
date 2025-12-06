import * as React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Slottable, AsChildProps } from "@/lib/polymorphic";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface StepsContextValue {
  currentStep: number;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const StepsContext = createContext<StepsContextValue | null>(null);

function useStepsContext() {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("Steps compound components must be used within Steps.Root");
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "ol";

interface RootOwnProps extends AsChildProps {
  as?: RootElement;
  children: ReactNode;
}

type RootProps<T extends React.ElementType = "ol"> = RootOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof RootOwnProps>;

function Root({ as = "ol", asChild, children, className, ...props }: RootProps) {
  const [currentStep] = React.useState(0);

  return (
    <StepsContext.Provider value={{ currentStep }}>
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="steps"
        className={cn("my-6 space-y-0 [counter-reset:step]", className)}
        {...props}
      >
        {children}
      </Slottable>
    </StepsContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Step
// -----------------------------------------------------------------------------

type StepElement = "li" | "div";

interface StepOwnProps extends AsChildProps {
  as?: StepElement;
  children: ReactNode;
}

type StepProps<T extends React.ElementType = "li"> = StepOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof StepOwnProps>;

function Step({ as = "li", asChild, children, className, ...props }: StepProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="steps.step"
      className={cn(
        "relative flex gap-4 pb-8 last:pb-0",
        // Connecting line (except for last item)
        "before:absolute before:left-[15px] before:top-[32px] before:bottom-0 before:w-[2px] before:bg-border last:before:hidden",
        "[counter-increment:step]",
        className
      )}
      {...props}
    >
      <>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground",
            "text-sm font-semibold",
            "ring-4 ring-background",
            "before:content-[counter(step)]"
          )}
          data-slot="steps.number"
        />
        <div className="flex-1 pt-1" data-slot="steps.content">
          {children}
        </div>
      </>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Pre-composed Default (for Markdoc)
// -----------------------------------------------------------------------------

interface StepsProps {
  children: ReactNode;
}

function StepsComposed({ children }: StepsProps) {
  return <Root>{children}</Root>;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const Steps = Object.assign(StepsComposed, {
  Root,
  Step,
});

