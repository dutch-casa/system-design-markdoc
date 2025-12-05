import * as React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { Slottable } from "@/lib/polymorphic";

import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type ParameterIn = "path" | "query" | "header" | "cookie";

interface Parameter {
  name: string;
  in: ParameterIn;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: {
    type?: string;
    format?: string;
    enum?: string[];
    default?: unknown;
  };
}

interface ParameterTableContextValue {
  parameters: Parameter[];
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const ParameterTableContext = createContext<ParameterTableContextValue | null>(
  null
);

function useParameterTableContext() {
  const context = useContext(ParameterTableContext);
  if (!context) {
    throw new Error(
      "ParameterTable compound components must be used within ParameterTable.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// In Badge Config
// -----------------------------------------------------------------------------

const IN_CONFIG: Record<ParameterIn, { label: string; className: string }> = {
  path: {
    label: "path",
    className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  query: {
    label: "query",
    className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  header: {
    label: "header",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  cookie: {
    label: "cookie",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
};

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "section";

interface RootProps extends ComponentPropsWithoutRef<"div"> {
  as?: RootElement;
  asChild?: boolean;
  parameters: Parameter[];
  children?: ReactNode;
}

function Root({
  as = "div",
  asChild,
  parameters,
  children,
  className,
  ...props
}: RootProps) {
  if (parameters.length === 0) return null;

  return (
    <ParameterTableContext.Provider value={{ parameters }}>
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="parameter-table"
        className={cn("overflow-hidden rounded-lg border border-border", className)}
        {...props}
      >
        {children ?? <Table />}
      </Slottable>
    </ParameterTableContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Table
// -----------------------------------------------------------------------------

type TableElement = "table" | "div";

interface TableProps extends ComponentPropsWithoutRef<"table"> {
  as?: TableElement;
  asChild?: boolean;
}

function Table({ as = "table", asChild, className, ...props }: TableProps) {
  const { parameters } = useParameterTableContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="parameter-table.table"
      className={cn("w-full text-sm", className)}
      {...props}
    >
      <thead>
        <tr className="border-b border-border bg-muted/50">
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Name
          </th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Type
          </th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </th>
        </tr>
      </thead>
      <tbody>
        {parameters.map((param) => (
          <Row key={`${param.in}-${param.name}`} parameter={param} />
        ))}
      </tbody>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Row
// -----------------------------------------------------------------------------

type RowElement = "tr" | "div";

interface RowProps extends ComponentPropsWithoutRef<"tr"> {
  as?: RowElement;
  asChild?: boolean;
  parameter: Parameter;
}

function Row({ as = "tr", asChild, parameter, className, ...props }: RowProps) {
  const inConfig = IN_CONFIG[parameter.in];
  const typeString = parameter.schema?.type ?? "string";
  const formatString = parameter.schema?.format
    ? `<${parameter.schema.format}>`
    : "";

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="parameter-table.row"
      data-required={parameter.required || undefined}
      data-deprecated={parameter.deprecated || undefined}
      className={cn(
        "border-b border-border last:border-b-0",
        parameter.deprecated && "opacity-60",
        className
      )}
      {...props}
    >
      <td className="px-3 py-2.5 align-top">
        <div className="flex items-center gap-2">
          <code className="font-mono text-sm font-medium text-foreground">
            {parameter.name}
          </code>
          {parameter.required && (
            <span className="text-rose-500 text-xs">*</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className={cn(
              "rounded px-1.5 py-0.5",
              "text-[10px] font-medium",
              inConfig.className
            )}
          >
            {inConfig.label}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 align-top">
        <code className="font-mono text-xs text-muted-foreground">
          {typeString}
          {formatString}
        </code>
        {parameter.schema?.enum && (
          <div className="mt-1 flex flex-wrap gap-1">
            {parameter.schema.enum.map((val) => (
              <code
                key={val}
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {val}
              </code>
            ))}
          </div>
        )}
        {parameter.schema?.default !== undefined && (
          <div className="mt-1 text-xs text-muted-foreground">
            Default:{" "}
            <code className="font-mono">
              {JSON.stringify(parameter.schema.default)}
            </code>
          </div>
        )}
      </td>
      <td className="px-3 py-2.5 align-top">
        <span className="text-sm text-muted-foreground">
          {parameter.description ?? "—"}
        </span>
        {parameter.deprecated && (
          <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            Deprecated
          </span>
        )}
      </td>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const ParameterTable = Object.assign(Root, {
  Table,
  Row,
});

export type { Parameter, ParameterIn };
