import * as React from "react";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  ElementType,
  ComponentPropsWithoutRef,
} from "react";
import { Copy, Check } from "lucide-react";
import { Slottable, AsChildProps } from "@/lib/polymorphic";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

// -----------------------------------------------------------------------------
// Monaco Editor (client-only, SSR disabled)
// -----------------------------------------------------------------------------

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[100px] items-center justify-center bg-muted/50"
      data-slot="code-block.loading"
    >
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  ),
});

// -----------------------------------------------------------------------------
// Language mapping (Markdoc/Prism -> Monaco)
// -----------------------------------------------------------------------------

const LANGUAGE_MAP: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "typescript",
  jsx: "javascript",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  yml: "yaml",
  md: "markdown",
  ex: "elixir",
  exs: "elixir",
  eex: "elixir",
  heex: "elixir",
  lean: "lean4",
  lean4: "lean4",
  text: "plaintext",
};

function resolveLanguage(lang: string): string {
  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_MAP[normalized] ?? normalized;
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface CodeBlockContextValue {
  language: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null);

function useCodeBlockContext() {
  const context = useContext(CodeBlockContext);
  if (!context) {
    throw new Error(
      "CodeBlock compound components must be used within CodeBlock.Root"
    );
  }
  return context;
}

// -----------------------------------------------------------------------------
// Root
// -----------------------------------------------------------------------------

type RootElement = "div" | "figure" | "section";

interface RootOwnProps extends AsChildProps {
  /** The code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** HTML element to render as */
  as?: RootElement;
}

type RootProps<T extends ElementType = "figure"> = RootOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof RootOwnProps>;

function Root({
  code,
  language = "text",
  as = "figure",
  asChild,
  children,
  className,
  ...props
}: RootProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [code]);

  return (
    <CodeBlockContext.Provider value={{ language, code, copied, onCopy }}>
      <Slottable
        as={as}
        asChild={asChild}
        className={`group relative my-4 ${className ?? ""}`}
        data-slot="code-block"
        data-language={language}
        aria-live="polite"
        {...props}
      >
        {children}
      </Slottable>
    </CodeBlockContext.Provider>
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
  const { language } = useCodeBlockContext();

  if (!language || language === "text") return null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      className={`flex items-center justify-between rounded-t-lg border border-b-0 border-border bg-muted/80 px-4 py-2 ${
        className ?? ""
      }`}
      data-slot="code-block.header"
      {...props}
    >
      {children ?? (
        <>
          <LanguageLabel />
          <CopyButton />
        </>
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// CopyButton
// -----------------------------------------------------------------------------

type CopyButtonElement = "button" | "div";

interface CopyButtonOwnProps extends AsChildProps {
  as?: CopyButtonElement;
}

type CopyButtonProps<T extends ElementType = "button"> = CopyButtonOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof CopyButtonOwnProps>;

function CopyButton({
  as = "button",
  asChild,
  children,
  className,
  ...props
}: CopyButtonProps) {
  const { copied, onCopy } = useCodeBlockContext();

  return (
    <Slottable
      as={as}
      asChild={asChild}
      onClick={onCopy}
      className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground ${
        className ?? ""
      }`}
      data-slot="code-block.copy"
      data-state={copied ? "copied" : "idle"}
      {...props}
    >
      {children ?? (
        <>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </>
      )}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// LanguageLabel
// -----------------------------------------------------------------------------

type LanguageLabelElement = "span" | "div";

interface LanguageLabelOwnProps extends AsChildProps {
  as?: LanguageLabelElement;
}

type LanguageLabelProps<T extends ElementType = "span"> =
  LanguageLabelOwnProps &
    Omit<ComponentPropsWithoutRef<T>, keyof LanguageLabelOwnProps>;

function LanguageLabel({
  as = "span",
  asChild,
  children,
  className,
  ...props
}: LanguageLabelProps) {
  const { language } = useCodeBlockContext();

  if (!language || language === "text") return null;

  return (
    <Slottable
      as={as}
      asChild={asChild}
      className={`font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground ${
        className ?? ""
      }`}
      data-slot="code-block.language"
      {...props}
    >
      {children ?? language}
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Content (Monaco Editor)
// -----------------------------------------------------------------------------

type ContentElement = "div" | "section";

interface ContentOwnProps extends AsChildProps {
  as?: ContentElement;
  /** Show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Minimum editor height in pixels */
  minHeight?: number;
  /** Maximum editor height in pixels */
  maxHeight?: number;
}

type ContentProps<T extends ElementType = "div"> = ContentOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof ContentOwnProps>;

function Content({
  as = "div",
  asChild,
  className,
  showLineNumbers = true,
  minHeight = 40,
  maxHeight = 600,
  ...props
}: ContentProps) {
  const { language, code } = useCodeBlockContext();
  const [height, setHeight] = useState(minHeight);

  const hasHeader = language && language !== "text";
  const monacoLanguage = resolveLanguage(language);

  const handleEditorMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      // Calculate height from content
      const lineCount = editor.getModel()?.getLineCount() ?? 1;
      const lineHeight = 20;
      const padding = 24;
      const calculatedHeight = Math.min(
        Math.max(lineCount * lineHeight + padding, minHeight),
        maxHeight
      );
      setHeight(calculatedHeight);

      // Define custom dark theme
      monaco.editor.defineTheme("code-block-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#1e1e1e",
          "editor.lineHighlightBackground": "#1e1e1e",
          "editorLineNumber.foreground": "#858585",
          "editorLineNumber.activeForeground": "#c6c6c6",
        },
      });
      monaco.editor.setTheme("code-block-dark");
    },
    [minHeight, maxHeight]
  );

  return (
    <Slottable
      as={as}
      asChild={asChild}
      className={`overflow-hidden border border-border bg-[#1e1e1e] ${
        hasHeader ? "rounded-b-lg rounded-t-none border-t-0" : "rounded-lg"
      } ${className ?? ""}`}
      data-slot="code-block.content"
      {...props}
    >
      <MonacoEditor
        height={height}
        language={monacoLanguage}
        value={code}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          readOnly: true,
          domReadOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: showLineNumbers ? "on" : "off",
          lineNumbersMinChars: 3,
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 8,
          renderLineHighlight: "none",
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            vertical: "hidden",
            horizontal: "auto",
            useShadows: false,
          },
          fontSize: 13,
          fontFamily:
            "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, monospace",
          padding: { top: 12, bottom: 12 },
          contextmenu: false,
          selectionHighlight: false,
          occurrencesHighlight: "off",
          renderWhitespace: "none",
          guides: { indentation: false, bracketPairs: false },
          matchBrackets: "never",
          bracketPairColorization: { enabled: false },
          unicodeHighlight: {
            ambiguousCharacters: false,
            invisibleCharacters: false,
            nonBasicASCII: false,
          },
          cursorStyle: "line-thin",
          cursorBlinking: "solid",
        }}
      />
    </Slottable>
  );
}

// -----------------------------------------------------------------------------
// Pre-composed Default (for Markdoc)
// -----------------------------------------------------------------------------

interface CodeBlockProps {
  children: ReactNode;
  "data-language"?: string;
}

function CodeBlockComposed({
  children,
  "data-language": language = "text",
}: CodeBlockProps) {
  const code = extractCode(children);

  return (
    <Root code={code} language={language}>
      <Header />
      <Content />
    </Root>
  );
}

// Minimal version without header
function CodeBlockMinimal({
  children,
  "data-language": language = "text",
}: CodeBlockProps) {
  const code = extractCode(children);

  return (
    <Root code={code} language={language}>
      <Content showLineNumbers={false} />
    </Root>
  );
}

// Helper to extract text from children (handles <code> wrapper from Markdoc)
function extractCode(children: ReactNode): string {
  if (typeof children === "string") return children;

  if (React.isValidElement(children)) {
    const element = children as React.ReactElement<{ children?: ReactNode }>;
    if (element.props.children) {
      return extractCode(element.props.children);
    }
  }

  if (Array.isArray(children)) {
    return children.map(extractCode).join("");
  }

  return "";
}

// -----------------------------------------------------------------------------
// Export as namespace
// -----------------------------------------------------------------------------

export const CodeBlock = Object.assign(CodeBlockComposed, {
  Root,
  Header,
  Content,
  CopyButton,
  LanguageLabel,
  Minimal: CodeBlockMinimal,
});
