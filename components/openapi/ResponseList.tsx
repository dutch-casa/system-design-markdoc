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
import { SchemaViewer } from "./SchemaViewer";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ResponseContent {
  schema?: Record<string, unknown>;
  example?: unknown;
}

interface ResponseData {
  description?: string;
  content?: Record<string, ResponseContent>;
}

type ResponsesMap = Record<string, ResponseData>;

interface ResponseListContextValue {
  responses: ResponsesMap;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const ResponseListContext = createContext<ResponseListContextValue | null>(null);

function useResponseListContext() {
  const context = useContext(ResponseListContext);
  if (!context) {
    throw new Error(
      "ResponseList compound components must be used within ResponseList.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Status Code Config
// -----------------------------------------------------------------------------

function getStatusConfig(code: string) {
  const codeNum = parseInt(code, 10);

  if (code === "default") {
    return { className: "bg-gray-500/10 text-gray-600 dark:text-gray-400" };
  }
  if (codeNum >= 200 && codeNum < 300) {
    return { className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
  }
  if (codeNum >= 300 && codeNum < 400) {
    return { className: "bg-sky-500/10 text-sky-600 dark:text-sky-400" };
  }
  if (codeNum >= 400 && codeNum < 500) {
    return { className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" };
  }
  if (codeNum >= 500) {
    return { className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" };
  }
  return { className: "bg-gray-500/10 text-gray-600 dark:text-gray-400" };
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "section";

interface RootProps extends ComponentPropsWithoutRef<"div"> {
  as?: RootElement;
  asChild?: boolean;
  responses: ResponsesMap;
  children?: ReactNode;
}

function Root({
  as = "div",
  asChild,
  responses,
  children,
  className,
  ...props
}: RootProps) {
  const codes = Object.keys(responses);

  if (codes.length === 0) return null;

  return (
    <ResponseListContext.Provider value={{ responses }}>
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="response-list"
        className={cn("overflow-hidden rounded-lg border border-border", className)}
        {...props}
      >
        {children ?? (
          <>
            <Header />
            <List />
          </>
        )}
      </Slottable>
    </ResponseListContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------

type HeaderElement = "header" | "div";

interface HeaderProps extends ComponentPropsWithoutRef<"header"> {
  as?: HeaderElement;
  asChild?: boolean;
  children?: ReactNode;
}

function Header({
  as = "header",
  asChild,
  children,
  className,
  ...props
}: HeaderProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="response-list.header"
      className={cn(
        "px-3 py-2 border-b border-border bg-muted/30",
        className
      )}
      {...props}
    >
      {children ?? (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Responses
        </span>
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// List
// -----------------------------------------------------------------------------

type ListElement = "div" | "ul";

interface ListProps extends ComponentPropsWithoutRef<"div"> {
  as?: ListElement;
  asChild?: boolean;
}

function List({ as = "div", asChild, className, ...props }: ListProps) {
  const { responses } = useResponseListContext();
  const codes = Object.keys(responses);

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="response-list.list"
      className={cn("divide-y divide-border", className)}
      {...props}
    >
      {codes.map((code) => (
        <Item key={code} code={code} response={responses[code]} />
      ))}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Item
// -----------------------------------------------------------------------------

type ItemElement = "div" | "li";

interface ItemProps extends ComponentPropsWithoutRef<"div"> {
  as?: ItemElement;
  asChild?: boolean;
  code: string;
  response: ResponseData;
}

function Item({
  as = "div",
  asChild,
  code,
  response,
  className,
  ...props
}: ItemProps) {
  const [isOpen, setIsOpen] = useState(code.startsWith("2"));
  const hasContent = response.content && Object.keys(response.content).length > 0;
  const config = getStatusConfig(code);

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="response-list.item"
      data-code={code}
      data-state={isOpen ? "open" : "closed"}
      className={cn(className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => hasContent && setIsOpen((prev) => !prev)}
        disabled={!hasContent}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "flex w-full items-center gap-3 px-3 py-2.5 text-left",
          "transition-colors duration-150",
          hasContent && "hover:bg-muted/50 cursor-pointer",
          !hasContent && "cursor-default"
        )}
      >
        {hasContent && (
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground",
              "transition-transform duration-150",
              isOpen && "rotate-90"
            )}
          />
        )}
        {!hasContent && <div className="w-3.5" />}
        <span
          className={cn(
            "shrink-0 rounded px-2 py-0.5",
            "font-mono text-xs font-semibold",
            config.className
          )}
        >
          {code}
        </span>
        <span className="text-sm text-muted-foreground">
          {response.description ?? "—"}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && hasContent && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <ItemContent response={response} />
          </motion.div>
        )}
      </AnimatePresence>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// ItemContent
// -----------------------------------------------------------------------------

interface ItemContentProps {
  response: ResponseData;
  className?: string;
}

function ItemContent({ response, className }: ItemContentProps) {
  const content = response.content;
  if (!content) return null;

  const mediaTypes = Object.keys(content);
  const [activeType, setActiveType] = useState(mediaTypes[0] ?? "application/json");
  const activeContent = content[activeType];

  return (
    <div
      data-slot="response-list.item-content"
      className={cn("border-t border-border bg-muted/20 p-3", className)}
    >
      {mediaTypes.length > 1 && (
        <div className="mb-3 flex items-center gap-1 rounded-md bg-muted p-0.5">
          {mediaTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              data-state={type === activeType ? "active" : "inactive"}
              className={cn(
                "rounded px-2 py-1 font-mono text-xs",
                "transition-colors duration-150",
                "data-[state=inactive]:text-muted-foreground",
                "data-[state=inactive]:hover:text-foreground",
                "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              )}
            >
              {type.split("/")[1] ?? type}
            </button>
          ))}
        </div>
      )}

      {activeContent?.schema && (
        <SchemaViewer schema={activeContent.schema} />
      )}

      {activeContent?.example && (
        <div className="mt-3">
          <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Example
          </h5>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">
            {JSON.stringify(activeContent.example, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const ResponseList = Object.assign(Root, {
  Header,
  List,
  Item,
  ItemContent,
});

export type { ResponsesMap, ResponseData, ResponseContent };
