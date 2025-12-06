"use client";

import * as React from "react";
import { DiffEditor } from "@monaco-editor/react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Diff Component
// -----------------------------------------------------------------------------

interface DiffProps {
  language?: string;
  originalText?: string;
  newText?: string;
}

export function Diff({ language, originalText: origText, newText: newTxt }: DiffProps) {
  // Use props directly from transform - preserve all whitespace
  const originalText = origText || "";
  const newText = newTxt || "";
  
  // Debug logging
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("[Diff component] originalText length:", originalText.length);
    console.log("[Diff component] originalText (with escapes):", JSON.stringify(originalText.substring(0, 100)));
    console.log("[Diff component] newText length:", newText.length);
    console.log("[Diff component] newText (with escapes):", JSON.stringify(newText.substring(0, 100)));
  }

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server to avoid hydration issues
  if (!mounted) {
    return (
      <div data-slot="diff" className="my-6">
        {language && (
          <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-[#3d3d3d] bg-[#2d2d2d] px-4 py-2">
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-gray-400">
              {language}
            </span>
          </div>
        )}
        <div
          className={cn(
            "overflow-hidden border border-[#3d3d3d] bg-[#1e1e1e] min-h-[200px]",
            language ? "rounded-b-lg border-t-0" : "rounded-lg"
          )}
        />
      </div>
    );
  }

  return (
    <div data-slot="diff" className="my-6" style={{ containerType: 'inline-size' }}>
      {/* Header */}
      {language && (
        <div className="flex items-center justify-between rounded-t-lg border border-b-0 border-[#3d3d3d] bg-[#2d2d2d] px-4 py-2">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-gray-400">
            {language}
          </span>
        </div>
      )}

      {/* Monaco Diff Editor */}
      <div
        className={cn(
          "overflow-hidden border border-[#3d3d3d] bg-[#1e1e1e]",
          language ? "rounded-b-lg border-t-0" : "rounded-lg"
        )}
      >
        <div className="diff-editor-wrapper" style={{ minHeight: '300px' }}>
          <DiffEditor
            height="300px"
            language={language || "text"}
            original={originalText}
            modified={newText}
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: true,
              ignoreTrimWhitespace: false,
              renderIndicators: false,
              enableSplitViewResizing: true,
              fontSize: 13,
              lineHeight: 22,
              lineNumbers: "on",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "off",
              automaticLayout: true,
              diffWordWrap: "off",
              renderOverviewRuler: true,
              overviewRulerLanes: 3,
            }}
            onMount={async (editor, monaco) => {
              // Configure diff editor appearance
              monaco.editor.defineTheme("custom-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [
                  {
                    token: "",
                    foreground: "D4D4D4",
                  },
                ],
                colors: {
                  "editor.background": "#1E1E1E",
                  "diffEditor.removedTextBackground": "#5c2a2a",
                  "diffEditor.insertedTextBackground": "#2a5c2a",
                  "diffEditor.removedLineBackground": "#4a1d1d",
                  "diffEditor.insertedLineBackground": "#1d4a1d",
                  "diffEditor.removedTextBorder": "transparent",
                  "diffEditor.insertedTextBorder": "transparent",
                  "diffEditor.border": "#3d3d3d",
                  "diffEditor.diagonalFill": "#2d2d2d",
                },
              });
              monaco.editor.setTheme("custom-dark");
              
              // Ensure side-by-side rendering
              editor.updateOptions({
                renderSideBySide: true,
              });
              
              // Configure both editors to preserve whitespace
              const originalEditor = editor.getOriginalEditor();
              const modifiedEditor = editor.getModifiedEditor();
              
              // Get models and configure tab size
              const originalModel = originalEditor.getModel();
              const modifiedModel = modifiedEditor.getModel();
              
              if (originalModel) {
                originalModel.updateOptions({
                  tabSize: 2,
                  insertSpaces: true, // Use spaces for consistent formatting
                });
              }
              
              if (modifiedModel) {
                modifiedModel.updateOptions({
                  tabSize: 2,
                  insertSpaces: true, // Use spaces for consistent formatting
                });
              }
              
              originalEditor.updateOptions({
                renderWhitespace: "all",
                lineNumbers: "on",
              });
              
              modifiedEditor.updateOptions({
                renderWhitespace: "all",
                lineNumbers: "on",
              });
              
              // Ensure diff editor shows changed lines properly
              // Monaco automatically detects changed lines (partial line changes)
              // and highlights them with both removed and inserted backgrounds
              editor.updateOptions({
                renderSideBySide: true,
                ignoreTrimWhitespace: false,
                renderIndicators: false,
                enableSplitViewResizing: true,
              });
            }}
            loading={
              <div className="flex items-center justify-center h-[300px] bg-[#1E1E1E] text-gray-400">
                Loading diff...
              </div>
            }
          />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        /* Override Monaco Editor styles for consistent dark theme */
        [data-slot="diff"] .monaco-editor {
          background-color: #1E1E1E !important;
        }
        
        [data-slot="diff"] .monaco-editor .margin {
          background-color: #1E1E1E !important;
        }
        
        [data-slot="diff"] .monaco-editor .monaco-editor-background {
          background-color: #1E1E1E !important;
        }
        
        /* Ensure side-by-side layout */
        [data-slot="diff"] .monaco-diff-editor {
          display: flex !important;
        }
        
        [data-slot="diff"] .monaco-diff-editor .monaco-editor {
          flex: 1 !important;
        }
        
        /* Ensure line numbers are visible */
        [data-slot="diff"] .monaco-editor .line-numbers {
          display: block !important;
        }
        
        [data-slot="diff"] .monaco-editor .margin {
          display: block !important;
        }
        
        /* Remove red borders/indicators from diff highlights */
        [data-slot="diff"] .monaco-diff-editor .monaco-diff-editor-glyph {
          display: none !important;
        }
        
        [data-slot="diff"] .monaco-diff-editor .line-insert,
        [data-slot="diff"] .monaco-diff-editor .line-delete,
        [data-slot="diff"] .monaco-diff-editor .char-insert,
        [data-slot="diff"] .monaco-diff-editor .char-delete {
          border: none !important;
          outline: none !important;
        }
        
        [data-slot="diff"] .monaco-diff-editor .monaco-diff-editor-side {
          border: none !important;
        }
        
        [data-slot="diff"] .monaco-diff-editor .diffViewport {
          border: none !important;
        }
        
        /* Mobile: stack vertically using container query */
        @container (max-width: 600px) {
          [data-slot="diff"] .monaco-diff-editor {
            flex-direction: column !important;
          }
          
          [data-slot="diff"] .monaco-diff-editor .monaco-editor {
            width: 100% !important;
            height: 300px !important;
          }
        }
      `}} />
    </div>
  );
}
