import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { useMermaid } from "@/hooks/useMermaid";
import { MermaidErrorBoundary } from "./MermaidErrorBoundary";
import { useRouter } from "next/router";
import panzoom, { PanZoom } from "panzoom";
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle, Loader2 } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface MermaidContextValue {
  svg: string | null;
  error: string | null;
  isPending: boolean;
  chart: string;
  panzoomRef: React.MutableRefObject<PanZoom | null>;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const MermaidContext = createContext<MermaidContextValue | null>(null);

function useMermaidContext() {
  const context = useContext(MermaidContext);
  if (!context) {
    throw new Error(
      "Mermaid compound components must be used within Mermaid.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Compound Components
// -----------------------------------------------------------------------------

type RootElement = "div" | "figure" | "section";

interface RootProps {
  chart: string;
  as?: RootElement;
  asChild?: boolean;
  children?: ReactNode;
}

function Root({ chart, as = "figure", asChild, children }: RootProps) {
  const { svg, error, isPending } = useMermaid(chart);
  const panzoomRef = useRef<PanZoom | null>(null);
  const Comp = asChild ? Slot : as;

  const zoomIn = useCallback(() => {
    panzoomRef.current?.smoothZoom(0, 0, 1.3);
  }, []);

  const zoomOut = useCallback(() => {
    panzoomRef.current?.smoothZoom(0, 0, 1 / 1.3);
  }, []);

  const reset = useCallback(() => {
    const instance = panzoomRef.current;
    if (!instance) return;
    instance.moveTo(0, 0);
    instance.zoomAbs(0, 0, 1);
  }, []);

  return (
    <MermaidContext.Provider
      value={{
        svg,
        error,
        isPending,
        chart,
        panzoomRef,
        zoomIn,
        zoomOut,
        reset,
      }}
    >
      <MermaidErrorBoundary chart={chart}>
        <Comp className="group relative my-6" data-slot="mermaid">
          {children}
        </Comp>
      </MermaidErrorBoundary>
    </MermaidContext.Provider>
  );
}

interface DiagramProps {
  asChild?: boolean;
}

function Diagram({ asChild }: DiagramProps) {
  const { svg, panzoomRef } = useMermaidContext();
  const router = useRouter();

  const handleContainerRef = useCallback(
    (container: HTMLDivElement | null) => {
      if (panzoomRef.current) {
        panzoomRef.current.dispose();
        panzoomRef.current = null;
      }

      if (!container || !svg) return;

      const svgElement = container.querySelector("svg");
      if (!svgElement) return;

      panzoomRef.current = panzoom(svgElement, {
        maxZoom: 5,
        minZoom: 0.5,
        bounds: true,
        boundsPadding: 0.1,
        zoomDoubleClickSpeed: 1,
      });
    },
    [svg, panzoomRef]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("[data-link], a");

      if (clickable) {
        const href =
          clickable.getAttribute("data-link") || clickable.getAttribute("href");

        if (href && href.startsWith("/")) {
          e.preventDefault();
          router.push(href);
        }
      }
    },
    [router]
  );

  if (!svg) return null;

  // asChild doesn't work well with ref + dangerouslySetInnerHTML
  if (asChild) {
    return (
      <Slot
        className="flex cursor-grab justify-center overflow-hidden rounded-lg border border-border bg-card p-6 touch-none active:cursor-grabbing [&_svg]:max-w-none"
        data-slot="mermaid.diagram"
      />
    );
  }

  return (
    <div
      ref={handleContainerRef}
      onClick={handleClick}
      className="flex cursor-grab justify-center overflow-hidden rounded-lg border border-border bg-card p-6 touch-none active:cursor-grabbing [&_svg]:max-w-none"
      data-slot="mermaid.diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

interface ControlsProps {
  asChild?: boolean;
  children?: ReactNode;
}

function Controls({ asChild, children }: ControlsProps) {
  const { zoomIn, zoomOut, reset } = useMermaidContext();
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className="absolute right-3 top-3 z-10 flex gap-1 rounded-lg border border-border bg-card p-1 shadow-sm"
      data-slot="mermaid.controls"
    >
      {children ?? (
        <>
          <ControlButton onClick={zoomIn} title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </ControlButton>
          <ControlButton onClick={zoomOut} title="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </ControlButton>
          <ControlButton onClick={reset} title="Reset zoom">
            <RotateCcw className="h-4 w-4" />
          </ControlButton>
        </>
      )}
    </Comp>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  title: string;
  asChild?: boolean;
  children: ReactNode;
}

function ControlButton({
  onClick,
  title,
  asChild,
  children,
}: ControlButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      onClick={onClick}
      title={title}
      className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
      data-slot="mermaid.control-button"
    >
      {children}
    </Comp>
  );
}

interface DiagramErrorProps {
  asChild?: boolean;
}

function DiagramError({ asChild }: DiagramErrorProps) {
  const { error, chart } = useMermaidContext();
  const Comp = asChild ? Slot : "div";

  if (!error) return null;

  return (
    <Comp
      className="rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20"
      data-slot="mermaid.error"
    >
      <div className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-300">
        <AlertCircle className="h-5 w-5" />
        <span>Diagram Error</span>
      </div>
      <pre className="mt-2 overflow-x-auto text-sm text-rose-600 dark:text-rose-400">
        {error}
      </pre>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-rose-500 hover:text-rose-600 dark:text-rose-400">
          View source
        </summary>
        <pre className="mt-2 overflow-x-auto rounded bg-rose-100 p-3 text-xs text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
          {chart}
        </pre>
      </details>
    </Comp>
  );
}

interface LoadingProps {
  asChild?: boolean;
}

function Loading({ asChild }: LoadingProps) {
  const { isPending } = useMermaidContext();
  const Comp = asChild ? Slot : "div";

  if (!isPending) return null;

  return (
    <Comp
      className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/50 p-12 text-muted-foreground"
      data-slot="mermaid.loading"
    >
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Rendering diagram...</span>
    </Comp>
  );
}

// Conditional renderer based on state
function StateSwitch() {
  const { svg, error, isPending } = useMermaidContext();

  if (error) return <DiagramError />;
  if (isPending) return <Loading />;
  if (!svg) return null;

  return (
    <>
      <Diagram />
      <Controls />
    </>
  );
}

// -----------------------------------------------------------------------------
// Pre-composed Default (for Markdoc)
// -----------------------------------------------------------------------------

interface MermaidProps {
  chart: string;
}

function MermaidComposed({ chart }: MermaidProps) {
  return (
    <Root chart={chart}>
      <StateSwitch />
    </Root>
  );
}

// -----------------------------------------------------------------------------
// Export as namespace
// -----------------------------------------------------------------------------

export const Mermaid = Object.assign(MermaidComposed, {
  Root,
  Diagram,
  Controls,
  ControlButton,
  DiagramError,
  Loading,
  StateSwitch,
});
