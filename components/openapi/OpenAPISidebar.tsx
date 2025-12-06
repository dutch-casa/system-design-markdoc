import * as React from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  ComponentPropsWithoutRef,
} from "react";
import { ChevronRight, Folder } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Slottable } from "@/lib/polymorphic";

import { cn } from "@/lib/utils";

function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "head"
  | "options";

interface EndpointItem {
  method: HttpMethod;
  path: string;
  operationId?: string;
  summary?: string;
}

interface TagGroup {
  name: string;
  description?: string;
  endpoints: EndpointItem[];
}

interface OpenAPISidebarContextValue {
  groups: TagGroup[];
  activeEndpoint: string | null;
  onEndpointClick: (operationId: string) => void;
  onNavigate?: () => void;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const OpenAPISidebarContext = createContext<OpenAPISidebarContextValue | null>(
  null
);

function useOpenAPISidebarContext() {
  const context = useContext(OpenAPISidebarContext);
  if (!context) {
    throw new Error(
      "OpenAPISidebar compound components must be used within OpenAPISidebar.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Method Badge Config
// -----------------------------------------------------------------------------

const METHOD_CONFIG: Record<HttpMethod, { label: string; className: string }> =
  {
    get: {
      label: "GET",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    post: {
      label: "POST",
      className: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    put: {
      label: "PUT",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    patch: {
      label: "PATCH",
      className: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    delete: {
      label: "DEL",
      className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    head: {
      label: "HEAD",
      className: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    options: {
      label: "OPT",
      className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    },
  };

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "nav" | "div" | "aside";

interface RootProps extends ComponentPropsWithoutRef<"nav"> {
  as?: RootElement;
  asChild?: boolean;
  groups: TagGroup[];
  activeEndpoint?: string | null;
  onEndpointClick?: (operationId: string) => void;
  /** Callback when a navigation action occurs (e.g., to close mobile sheet) */
  onNavigate?: () => void;
  children?: ReactNode;
}

function Root({
  as = "nav",
  asChild,
  groups,
  activeEndpoint = null,
  onEndpointClick = () => {},
  onNavigate,
  children,
  className,
  ...props
}: RootProps) {
  return (
    <OpenAPISidebarContext.Provider
      value={{ groups, activeEndpoint, onEndpointClick, onNavigate }}
    >
      <Slottable
        as={as}
        asChild={asChild}
        data-slot="openapi-sidebar"
        aria-label="API endpoints navigation"
        className={cn("px-3 py-4", className)}
        {...props}
      >
        {children ?? (
          <>
            {groups.map((group) => (
              <Group key={group.name} group={group} />
            ))}
          </>
        )}
      </Slottable>
    </OpenAPISidebarContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Group
// -----------------------------------------------------------------------------

type GroupElement = "div" | "section";

interface GroupProps extends ComponentPropsWithoutRef<"div"> {
  as?: GroupElement;
  asChild?: boolean;
  group: TagGroup;
  defaultOpen?: boolean;
}

function Group({
  as = "div",
  asChild,
  group,
  defaultOpen = true,
  className,
  ...props
}: GroupProps) {
  const { activeEndpoint, onEndpointClick, onNavigate } = useOpenAPISidebarContext();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const prefersReducedMotion = useReducedMotion();

  const hasActiveEndpoint = group.endpoints.some(
    (ep) => ep.operationId === activeEndpoint
  );

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="openapi-sidebar.group"
      className={cn("mb-1", className)}
      {...props}
    >
      <>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          data-state={isOpen ? "open" : "closed"}
          aria-expanded={isOpen}
          className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors duration-150 ease-out hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <ChevronRight
            className="size-3.5 shrink-0 text-foreground/40 transition-transform duration-150 ease-out group-hover:text-foreground/60 group-data-[state=open]:rotate-90 motion-reduce:transition-none"
            aria-hidden="true"
          />
          <Folder
            className="size-4 shrink-0 text-foreground/50 transition-colors duration-150 ease-out group-hover:text-foreground/70"
            aria-hidden="true"
          />
          <span className="truncate">{group.name}</span>
          <span className="ml-auto text-xs tabular-nums text-muted-foreground/60">
            {group.endpoints.length}
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              data-slot="openapi-sidebar.list-wrapper"
              initial={prefersReducedMotion ? undefined : { height: 0 }}
              animate={prefersReducedMotion ? undefined : { height: "auto" }}
              exit={prefersReducedMotion ? undefined : { height: 0 }}
              transition={transition}
              className="overflow-hidden"
            >
              <List>
                {group.endpoints.map((endpoint, index) => (
                  <Item
                    key={
                      endpoint.operationId ??
                      `${endpoint.method}-${endpoint.path}`
                    }
                    index={index}
                  >
                    <EndpointLink
                      endpoint={endpoint}
                      isActive={endpoint.operationId === activeEndpoint}
                      onClick={() => {
                        if (endpoint.operationId) {
                          onEndpointClick(endpoint.operationId);
                          onNavigate?.();
                        }
                      }}
                    />
                  </Item>
                ))}
              </List>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// List
// -----------------------------------------------------------------------------

type ListElement = "ul" | "div";

interface ListProps extends ComponentPropsWithoutRef<"ul"> {
  as?: ListElement;
  asChild?: boolean;
  children: ReactNode;
}

function List({
  as = "ul",
  asChild,
  children,
  className,
  ...props
}: ListProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="openapi-sidebar.list"
      className={cn("flex flex-col gap-0.5 py-1 pl-7", className)}
      {...props}
    >
      {children}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Item
// -----------------------------------------------------------------------------

interface ItemProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

function Item({ children, index = 0, className }: ItemProps) {
  return (
    <motion.li
      data-slot="openapi-sidebar.item"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1] as const,
        delay: index * 0.02,
      }}
      className={className}
    >
      {children}
    </motion.li>
  );
}

// -----------------------------------------------------------------------------
// EndpointLink
// -----------------------------------------------------------------------------

interface EndpointLinkProps extends ComponentPropsWithoutRef<"button"> {
  asChild?: boolean;
  endpoint: EndpointItem;
  isActive: boolean;
  onClick: () => void;
}

function EndpointLink({
  asChild,
  endpoint,
  isActive,
  onClick,
  className,
  ...props
}: EndpointLinkProps) {
  return (
    <Slottable
      as="button"
      asChild={asChild}
      type="button"
      onClick={onClick}
      data-slot="openapi-sidebar.endpoint-link"
      data-state={isActive ? "active" : "inactive"}
      className={cn(
        "flex w-full items-center gap-2",
        "rounded-lg px-3 py-2 text-sm",
        "text-foreground/60",
        "transition-colors duration-150 ease-out",
        "hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-medium",
        "motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <MethodBadge method={endpoint.method} isActive={isActive} />
      <span className="truncate">{endpoint.summary ?? endpoint.path}</span>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// MethodBadge
// -----------------------------------------------------------------------------

type MethodBadgeElement = "span" | "code" | "div";

interface MethodBadgeProps extends ComponentPropsWithoutRef<"span"> {
  as?: MethodBadgeElement;
  asChild?: boolean;
  method: HttpMethod;
  isActive?: boolean;
}

function MethodBadge({
  as = "span",
  asChild,
  method,
  isActive = false,
  className,
  ...props
}: MethodBadgeProps) {
  const config = METHOD_CONFIG[method];

  return (
    <Slottable
      as={as}
      asChild={asChild}
      data-slot="openapi-sidebar.method-badge"
      data-method={method}
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5",
        "text-[10px] font-semibold uppercase tracking-wide",
        config.className,
        isActive && "bg-primary-foreground/20 text-primary-foreground",
        className
      )}
      {...props}
    >
      {config.label}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export const OpenAPISidebar = Object.assign(Root, {
  Group,
  List,
  Item,
  EndpointLink,
  MethodBadge,
});

export type { TagGroup, EndpointItem, HttpMethod };
export { METHOD_CONFIG };
