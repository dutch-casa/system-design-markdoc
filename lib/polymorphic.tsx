import React, { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";

// -----------------------------------------------------------------------------
// Polymorphic "as" prop types
// -----------------------------------------------------------------------------

type AsProp<C extends ElementType> = {
  as?: C;
};

type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends ElementType,
  Props = object
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type PolymorphicRef<C extends ElementType> = ComponentPropsWithoutRef<C>["ref"];

type PolymorphicComponentPropWithRef<
  C extends ElementType,
  Props = object
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

// -----------------------------------------------------------------------------
// AsChild prop types
// -----------------------------------------------------------------------------

interface AsChildProps {
  asChild?: boolean;
  children?: ReactNode;
}

// -----------------------------------------------------------------------------
// Slottable component - renders as Slot when asChild is true
// -----------------------------------------------------------------------------

interface SlottableProps<T extends ElementType = "div"> extends AsChildProps {
  as?: T;
  className?: string;
}

function Slottable<T extends ElementType = "div">({
  asChild,
  children,
  as,
  ...props
}: SlottableProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SlottableProps<T>>) {
  if (asChild) {
    return <Slot {...props}>{children}</Slot>;
  }

  const Component = as || "div";
  return <Component {...props}>{children}</Component>;
}

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export type {
  AsProp,
  PolymorphicComponentProp,
  PolymorphicComponentPropWithRef,
  PolymorphicRef,
  AsChildProps,
};

export { Slot, Slottable };
