import React, {
  createContext,
  useContext,
  ReactNode,
  ElementType,
  ComponentPropsWithoutRef,
} from "react";
import {
  Loader2,
  ExternalLink,
  Maximize2,
  Minimize2,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Slottable, AsChildProps } from "@/lib/polymorphic";
import {
  useProofBlock,
  ProofProject,
  UseProofBlockReturn,
} from "@/hooks/useProofBlock";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ProofBlockContextValue extends UseProofBlockReturn {}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const ProofBlockContext = createContext<ProofBlockContextValue | null>(null);

function useProofBlockContext() {
  const context = useContext(ProofBlockContext);
  if (!context) {
    throw new Error(
      "ProofBlock compound components must be used within ProofBlock.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "figure" | "section";

interface RootOwnProps extends AsChildProps {
  /** The Lean 4 proof code */
  code: string;
  /** Project/environment to use */
  project?: ProofProject;
  /** HTML element to render as */
  as?: RootElement;
}

type RootProps<T extends ElementType = "figure"> = RootOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof RootOwnProps>;

function Root({
  code,
  project = "mathlib-stable",
  as = "figure",
  asChild,
  children,
  className,
  ...props
}: RootProps) {
  const proofState = useProofBlock(code, project);

  return (
    <ProofBlockContext.Provider value={proofState}>
      <Slottable
        as={as}
        asChild={asChild}
        className={`group relative my-6 ${className ?? ""}`}
        data-slot="proof-block"
        data-project={project}
        data-expanded={proofState.isExpanded}
        {...props}
      >
        {children}
      </Slottable>
    </ProofBlockContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------

type HeaderElement = "div" | "header" | "figcaption";

interface HeaderOwnProps extends AsChildProps {
  as?: HeaderElement;
}

type HeaderProps<T extends ElementType = "div"> = HeaderOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof HeaderOwnProps>;

function Header({
  as = "div",
  asChild,
  children,
  className,
  ...props
}: HeaderProps) {
  return (
    <Slottable
      as={as}
      asChild={asChild}
      className={`flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-muted/80 px-4 py-2 ${
        className ?? ""
      }`}
      data-slot="proof-block.header"
      {...props}
    >
      {children ?? (
        <>
          <ProjectLabel />
          <div className="flex items-center gap-1">
            <ExpandButton />
            <ExternalButton />
          </div>
        </>
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// ProjectLabel
// -----------------------------------------------------------------------------

const PROJECT_LABELS: Record<ProofProject, string> = {
  "mathlib-stable": "Lean 4 + Mathlib",
  "mathlib-demo": "Mathlib Demo",
  std: "Lean 4 + Std",
  lean: "Lean 4",
};

interface ProjectLabelOwnProps extends AsChildProps {
  as?: "span" | "div";
}

type ProjectLabelProps<T extends ElementType = "span"> = ProjectLabelOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof ProjectLabelOwnProps>;

function ProjectLabel({
  as = "span",
  asChild,
  children,
  className,
  ...props
}: ProjectLabelProps) {
  const { project } = useProofBlockContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      className={`flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground ${
        className ?? ""
      }`}
      data-slot="proof-block.project-label"
      {...props}
    >
      {children ?? (
        <>
          <BookOpen className="h-3.5 w-3.5" />
          <span>{PROJECT_LABELS[project]}</span>
        </>
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// ExpandButton
// -----------------------------------------------------------------------------

interface ExpandButtonOwnProps extends AsChildProps {
  as?: "button" | "div";
}

type ExpandButtonProps<T extends ElementType = "button"> =
  ExpandButtonOwnProps &
    Omit<ComponentPropsWithoutRef<T>, keyof ExpandButtonOwnProps>;

function ExpandButton({
  as = "button",
  asChild,
  children,
  className,
  ...props
}: ExpandButtonProps) {
  const { isExpanded, toggleExpanded } = useProofBlockContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      onClick={toggleExpanded}
      title={isExpanded ? "Collapse" : "Expand"}
      className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${
        className ?? ""
      }`}
      data-slot="proof-block.expand"
      data-state={isExpanded ? "expanded" : "collapsed"}
      {...props}
    >
      {children ??
        (isExpanded ? (
          <Minimize2 className="h-3.5 w-3.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" />
        ))}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// ExternalButton
// -----------------------------------------------------------------------------

interface ExternalButtonOwnProps extends AsChildProps {
  as?: "button" | "div";
}

type ExternalButtonProps<T extends ElementType = "button"> =
  ExternalButtonOwnProps &
    Omit<ComponentPropsWithoutRef<T>, keyof ExternalButtonOwnProps>;

function ExternalButton({
  as = "button",
  asChild,
  children,
  className,
  ...props
}: ExternalButtonProps) {
  const { openExternal } = useProofBlockContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      onClick={openExternal}
      title="Open in lean4web"
      className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${
        className ?? ""
      }`}
      data-slot="proof-block.external"
      {...props}
    >
      {children ?? <ExternalLink className="h-3.5 w-3.5" />}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Content (Iframe)
// -----------------------------------------------------------------------------

type ContentElement = "div" | "section";

interface ContentOwnProps extends AsChildProps {
  as?: ContentElement;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
}

type ContentProps<T extends ElementType = "div"> = ContentOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof ContentOwnProps>;

function Content({
  as = "div",
  asChild,
  className,
  minHeight = 300,
  maxHeight = 600,
  ...props
}: ContentProps) {
  const { iframeUrl, isLoaded, isExpanded, onLoad } = useProofBlockContext();

  const height = isExpanded ? maxHeight : minHeight;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      className={`relative overflow-hidden rounded-b-lg border border-t-0 border-border bg-[#1e1e1e] ${
        className ?? ""
      }`}
      data-slot="proof-block.content"
      {...props}
    >
      <>
        {!isLoaded && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-[#1e1e1e]"
            data-slot="proof-block.loading"
          >
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading Lean environment...</span>
            </div>
          </div>
        )}
        <iframe
          src={iframeUrl}
          onLoad={onLoad}
          title="Lean 4 Proof"
          className="h-full w-full"
          style={{ height, minHeight }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          loading="lazy"
        />
      </>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Loading
// -----------------------------------------------------------------------------

interface LoadingOwnProps extends AsChildProps {
  as?: "div" | "span";
}

type LoadingProps<T extends ElementType = "div"> = LoadingOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof LoadingOwnProps>;

function Loading({ as = "div", asChild, className, ...props }: LoadingProps) {
  const { isLoaded } = useProofBlockContext();

  if (isLoaded) return null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      className={`flex items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/50 p-12 text-muted-foreground ${
        className ?? ""
      }`}
      data-slot="proof-block.loading"
      {...props}
    >
      <>
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading Lean environment...</span>
      </>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Error
// -----------------------------------------------------------------------------

interface ErrorOwnProps extends AsChildProps {
  as?: "div" | "section";
  error?: string;
}

type ErrorProps<T extends ElementType = "div"> = ErrorOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof ErrorOwnProps>;

function ErrorDisplay({
  as = "div",
  asChild,
  error,
  className,
  ...props
}: ErrorProps) {
  const { code } = useProofBlockContext();

  if (!error) return null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      className={`rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20 ${
        className ?? ""
      }`}
      data-slot="proof-block.error"
      {...props}
    >
      <>
        <div className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-5 w-5" />
          <span>Proof Error</span>
        </div>
        <pre className="mt-2 overflow-x-auto text-sm text-rose-600 dark:text-rose-400">
          {error}
        </pre>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-rose-500 hover:text-rose-600 dark:text-rose-400">
            View source
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-rose-100 p-3 text-xs text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
            {code}
          </pre>
        </details>
      </>
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Pre-composed Default (for Markdoc)
// -----------------------------------------------------------------------------

interface ProofBlockProps {
  code: string;
  project?: ProofProject;
}

function ProofBlockComposed({
  code,
  project = "mathlib-stable",
}: ProofBlockProps) {
  return (
    <Root code={code} project={project}>
      <Header />
      <Content />
    </Root>
  );
}

// -----------------------------------------------------------------------------
// Export as namespace
// -----------------------------------------------------------------------------

export const ProofBlock = Object.assign(ProofBlockComposed, {
  Root,
  Header,
  Content,
  Loading,
  Error: ErrorDisplay,
  ProjectLabel,
  ExpandButton,
  ExternalButton,
});

export type { ProofProject };
