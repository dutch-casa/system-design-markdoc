import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import yaml from "js-yaml";

import {
  CommandDialog as CommandDialogPrimitive,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { NAV_SECTIONS, type SearchableItem } from "@/lib/navigation";
import {
  METHOD_CONFIG,
  type HttpMethod,
} from "@/components/openapi/OpenAPISidebar";

type APIEndpoint = {
  operationId: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  tag: string;
};

function getDocSearchableItems(): SearchableItem[] {
  const items: SearchableItem[] = [];

  for (const section of NAV_SECTIONS) {
    for (const link of section.links) {
      items.push({
        type: "page",
        href: link.href,
        label: link.label,
        section: section.title,
        icon: section.icon,
      });
    }
  }

  return items;
}

const HTTP_METHODS: HttpMethod[] = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
];

function parseOpenAPISpec(spec: any): APIEndpoint[] {
  const endpoints: APIEndpoint[] = [];

  if (!spec?.paths) return endpoints;

  for (const [pathStr, pathItem] of Object.entries(spec.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = (pathItem as any)?.[method];
      if (!operation) continue;

      const tags = operation.tags ?? ["default"];
      endpoints.push({
        operationId: operation.operationId ?? `${method}-${pathStr}`,
        method,
        path: pathStr,
        summary: operation.summary,
        tag: tags[0],
      });
    }
  }

  return endpoints;
}

async function fetchOpenAPIEndpoints(): Promise<APIEndpoint[]> {
  const res = await fetch("/openapi.yaml");
  if (!res.ok) return [];
  const text = await res.text();
  const spec = yaml.load(text);
  return parseOpenAPISpec(spec);
}

// Keyboard shortcut subscription for useSyncExternalStore
const keyboardStore = {
  isOpen: false,
  listeners: new Set<() => void>(),

  subscribe(listener: () => void) {
    if (keyboardStore.listeners.size === 0) {
      document.addEventListener("keydown", keyboardStore.handleKeyDown);
      window.addEventListener(
        "open-command-palette",
        keyboardStore.handleCustomEvent
      );
    }
    keyboardStore.listeners.add(listener);
    return () => {
      keyboardStore.listeners.delete(listener);
      if (keyboardStore.listeners.size === 0) {
        document.removeEventListener("keydown", keyboardStore.handleKeyDown);
        window.removeEventListener(
          "open-command-palette",
          keyboardStore.handleCustomEvent
        );
      }
    };
  },

  getSnapshot() {
    return keyboardStore.isOpen;
  },

  handleKeyDown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      keyboardStore.isOpen = !keyboardStore.isOpen;
      keyboardStore.listeners.forEach((l) => l());
    }
  },

  handleCustomEvent() {
    keyboardStore.isOpen = true;
    keyboardStore.listeners.forEach((l) => l());
  },

  setOpen(value: boolean) {
    keyboardStore.isOpen = value;
    keyboardStore.listeners.forEach((l) => l());
  },
};

export function CommandDialog() {
  const router = useRouter();
  const docItems = useMemo(() => getDocSearchableItems(), []);

  const open = useSyncExternalStore(
    keyboardStore.subscribe,
    keyboardStore.getSnapshot,
    () => false
  );

  const { data: apiEndpoints = [] } = useQuery({
    queryKey: ["openapi-endpoints"],
    queryFn: fetchOpenAPIEndpoints,
    staleTime: Infinity,
  });

  const handleSelectDoc = useCallback(
    (href: string) => {
      keyboardStore.setOpen(false);
      router.push(href);
    },
    [router]
  );

  const handleSelectEndpoint = useCallback(
    (operationId: string) => {
      keyboardStore.setOpen(false);
      router.push(`/api-docs#${operationId}`);
    },
    [router]
  );

  const docGroups = NAV_SECTIONS.map((section) => ({
    title: section.title,
    icon: section.icon,
    items: docItems.filter((item) => item.section === section.title),
  }));

  // Group API endpoints by tag
  const apiGroups = useMemo(() => {
    const tagMap = new Map<string, APIEndpoint[]>();
    for (const endpoint of apiEndpoints) {
      if (!tagMap.has(endpoint.tag)) {
        tagMap.set(endpoint.tag, []);
      }
      tagMap.get(endpoint.tag)!.push(endpoint);
    }
    return Array.from(tagMap.entries()).map(([tag, endpoints]) => ({
      title: tag,
      endpoints,
    }));
  }, [apiEndpoints]);

  return (
    <CommandDialogPrimitive
      open={open}
      onOpenChange={keyboardStore.setOpen}
      title="Search"
      description="Search documentation and API endpoints"
    >
      <CommandInput placeholder="Search docs and API..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Documentation groups first (higher priority) */}
        {docGroups.map((group) => (
          <CommandGroup key={group.title} heading={group.title}>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={`${item.label} ${item.section}`}
                  onSelect={() => handleSelectDoc(item.href)}
                >
                  <Icon className="mr-2 size-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}

        {/* API endpoint groups */}
        {apiGroups.map((group) => (
          <CommandGroup
            key={`api-${group.title}`}
            heading={`API: ${group.title}`}
          >
            {group.endpoints.map((endpoint) => {
              const methodConfig = METHOD_CONFIG[endpoint.method];
              return (
                <CommandItem
                  key={endpoint.operationId}
                  value={`${endpoint.summary ?? endpoint.path} ${
                    endpoint.method
                  } ${endpoint.tag} api`}
                  onSelect={() => handleSelectEndpoint(endpoint.operationId)}
                >
                  <span
                    className={`mr-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${methodConfig.className}`}
                  >
                    {methodConfig.label}
                  </span>
                  <span className="truncate">
                    {endpoint.summary ?? endpoint.path}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialogPrimitive>
  );
}
