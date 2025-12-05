import { useState, useCallback, useMemo } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type ProofProject = "mathlib-stable" | "mathlib-demo" | "std" | "lean";

export interface ProofBlockState {
  /** The Lean 4 code content */
  code: string;
  /** Selected project/environment */
  project: ProofProject;
  /** Whether the iframe has loaded */
  isLoaded: boolean;
  /** Whether the proof block is expanded (full editor view) */
  isExpanded: boolean;
  /** The generated iframe URL */
  iframeUrl: string;
}

export interface ProofBlockActions {
  /** Mark iframe as loaded */
  onLoad: () => void;
  /** Toggle expanded/collapsed state */
  toggleExpanded: () => void;
  /** Open in external lean4web tab */
  openExternal: () => void;
}

export interface UseProofBlockReturn
  extends ProofBlockState,
    ProofBlockActions {}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const LEAN4WEB_BASE = "https://live.lean-lang.org";

// -----------------------------------------------------------------------------
// URL Encoding
// -----------------------------------------------------------------------------

/**
 * Compress code using LZString-compatible encoding for lean4web.
 * lean4web uses the `codez` parameter with base64url-encoded LZ-compressed code.
 * For simplicity, we use the `code` parameter with URL encoding for now.
 */
function encodeCode(code: string): string {
  return encodeURIComponent(code);
}

/**
 * Build the lean4web iframe URL.
 */
function buildIframeUrl(code: string, project: ProofProject): string {
  const encodedCode = encodeCode(code);
  // Use hash-based routing: #project=X&code=Y
  return `${LEAN4WEB_BASE}/#project=${project}&code=${encodedCode}`;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useProofBlock(
  code: string,
  project: ProofProject = "mathlib-stable"
): UseProofBlockReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const iframeUrl = useMemo(
    () => buildIframeUrl(code, project),
    [code, project]
  );

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const openExternal = useCallback(() => {
    window.open(iframeUrl, "_blank", "noopener,noreferrer");
  }, [iframeUrl]);

  return {
    code,
    project,
    isLoaded,
    isExpanded,
    iframeUrl,
    onLoad,
    toggleExpanded,
    openExternal,
  };
}
