import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Slottable } from "@/lib/polymorphic";

import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface SchemaObject {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  required?: string[];
  enum?: unknown[];
  default?: unknown;
  nullable?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  $ref?: string;
  [key: string]: unknown;
}

interface SchemaViewerContextValue {
  schema: SchemaObject;
  depth: number;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const SchemaViewerContext = createContext<SchemaViewerContextValue | null>(null);

function useSchemaViewerContext() {
  const context = useContext(SchemaViewerContext);
  if (!context) {
    throw new Error(
      "SchemaViewer compound components must be used within SchemaViewer.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Type Badge Config
// -----------------------------------------------------------------------------

function getTypeConfig(type: string) {
  switch (type) {
    case "string":
      return { className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
    case "integer":
    case "number":
      return { className: "bg-sky-500/10 text-sky-600 dark:text-sky-400" };
    case "boolean":
      return { className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" };
    case "array":
      return { className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" };
    case "object":
      return { className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" };
    default:
      return { className: "bg-gray-500/10 text-gray-600 dark:text-gray-400" };
  }
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "section";

interface RootProps extends ComponentPropsWithoutRef<"div"> {
  as?: RootElement;
  asChild?: boolean;
  schema: Record<string, unknown>;
  depth?: number;
  children?: ReactNode;
}

function Root({
  as = "div",
  asChild,
  schema,
  depth = 0,
  children,
  className,
  ...props
}: RootProps) {
  const typedSchema = schema as SchemaObject;

  return (
    <SchemaViewerContext.Provider value={{ schema: typedSchema, depth }}>
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="schema-viewer"
        className={cn(
          depth === 0 && "rounded-lg border border-border overflow-hidden",
          className
        )}
        {...props}
      >
        {children ?? <Properties />}
      </Slottable>
    </SchemaViewerContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Properties
// -----------------------------------------------------------------------------

type PropertiesElement = "div" | "ul";

interface PropertiesProps extends ComponentPropsWithoutRef<"div"> {
  as?: PropertiesElement;
  asChild?: boolean;
}

function Properties({ as = "div", asChild, className, ...props }: PropertiesProps) {
  const { schema, depth } = useSchemaViewerContext();

  // Handle different schema types
  if (schema.allOf || schema.oneOf || schema.anyOf) {
    const combinator = schema.allOf ? "allOf" : schema.oneOf ? "oneOf" : "anyOf";
    const schemas = schema[combinator] as SchemaObject[];

    return (
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="schema-viewer.properties"
        className={cn("divide-y divide-border", className)}
        {...props}
      >
        <div className="px-3 py-2 bg-muted/30">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {combinator}
          </span>
        </div>
        {schemas.map((s, i) => (
          <SchemaViewer key={i} schema={s} depth={depth + 1} />
        ))}
      </Slottable>
    );
  }

  if (schema.type === "array" && schema.items) {
    return (
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="schema-viewer.properties"
        className={cn(className)}
        {...props}
      >
        <div className="px-3 py-2 bg-muted/30 flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Array of
          </span>
          <TypeBadge type={schema.items.type ?? "object"} />
        </div>
        <SchemaViewer schema={schema.items} depth={depth + 1} />
      </Slottable>
    );
  }

  const properties = schema.properties ?? {};
  const required = schema.required ?? [];
  const propertyNames = Object.keys(properties);

  if (propertyNames.length === 0) {
    return (
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="schema-viewer.properties"
        className={cn("px-3 py-2 text-sm text-muted-foreground", className)}
        {...props}
      >
        {schema.type ? (
          <div className="flex items-center gap-2">
            <TypeBadge type={schema.type} format={schema.format} />
            {schema.description && (
              <span className="text-muted-foreground">{schema.description}</span>
            )}
          </div>
        ) : (
          <span>No properties defined</span>
        )}
      </Slottable>
    );
  }

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="schema-viewer.properties"
      className={cn("divide-y divide-border", className)}
      {...props}
    >
      {propertyNames.map((name) => (
        <Property
          key={name}
          name={name}
          schema={properties[name]}
          required={required.includes(name)}
          depth={depth}
        />
      ))}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Property
// -----------------------------------------------------------------------------

interface PropertyProps {
  name: string;
  schema: SchemaObject;
  required: boolean;
  depth: number;
  className?: string;
}

function Property({ name, schema, required, depth, className }: PropertyProps) {
  const hasChildren =
    (schema.type === "object" && schema.properties) ||
    (schema.type === "array" && schema.items);
  const [isOpen, setIsOpen] = useState(depth < 2);

  return (
    <div
      data-slot="schema-viewer.property"
      data-type={schema.type}
      data-required={required || undefined}
      data-deprecated={schema.deprecated || undefined}
      className={cn(schema.deprecated && "opacity-60", className)}
    >
      <button
        type="button"
        onClick={() => hasChildren && setIsOpen((prev) => !prev)}
        disabled={!hasChildren}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "flex w-full items-start gap-2 px-3 py-2.5 text-left",
          "transition-colors duration-150",
          hasChildren && "hover:bg-muted/50 cursor-pointer",
          !hasChildren && "cursor-default"
        )}
      >
        {hasChildren ? (
          <ChevronRight
            className={cn(
              "mt-0.5 size-3.5 shrink-0 text-muted-foreground",
              "transition-transform duration-150",
              isOpen && "rotate-90"
            )}
          />
        ) : (
          <div className="w-3.5 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <code className="font-mono text-sm font-medium text-foreground">
              {name}
            </code>
            {required && <span className="text-rose-500 text-xs">*</span>}
            <TypeBadge type={schema.type ?? "any"} format={schema.format} />
            {schema.nullable && (
              <span className="text-[10px] text-muted-foreground">nullable</span>
            )}
            {schema.readOnly && (
              <span className="text-[10px] text-muted-foreground">read-only</span>
            )}
            {schema.writeOnly && (
              <span className="text-[10px] text-muted-foreground">write-only</span>
            )}
            {schema.deprecated && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Deprecated
              </span>
            )}
          </div>

          {schema.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {schema.description}
            </p>
          )}

          {schema.enum && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {schema.enum.map((val, i) => (
                <code
                  key={i}
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {JSON.stringify(val)}
                </code>
              ))}
            </div>
          )}

          {schema.default !== undefined && (
            <div className="mt-1 text-xs text-muted-foreground">
              Default:{" "}
              <code className="font-mono">{JSON.stringify(schema.default)}</code>
            </div>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-muted/20 pl-6">
              {schema.type === "array" && schema.items ? (
                <SchemaViewer schema={schema.items} depth={depth + 1} />
              ) : schema.properties ? (
                <SchemaViewer schema={schema} depth={depth + 1} />
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -----------------------------------------------------------------------------
// TypeBadge
// -----------------------------------------------------------------------------

type TypeBadgeElement = "span" | "code";

interface TypeBadgeProps extends ComponentPropsWithoutRef<"span"> {
  as?: TypeBadgeElement;
  asChild?: boolean;
  type: string;
  format?: string;
}

function TypeBadge({
  as = "span",
  asChild,
  type,
  format,
  className,
  ...props
}: TypeBadgeProps) {
  const config = getTypeConfig(type);
  const displayType = format ? `${type}<${format}>` : type;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="schema-viewer.type-badge"
      data-type={type}
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5",
        "font-mono text-[10px] font-medium",
        config.className,
        className
      )}
      {...props}
    >
      {displayType}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const SchemaViewer = Object.assign(Root, {
  Properties,
  Property,
  TypeBadge,
});

export type { SchemaObject };
