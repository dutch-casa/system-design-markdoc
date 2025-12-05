import katex from "katex";
import { useMemo } from "react";

interface KaTeXProps {
  /** The LaTeX expression to render */
  math: string;
  /** Whether to render in display mode (centered, larger) or inline */
  display?: boolean;
}

/**
 * Renders LaTeX math expressions using KaTeX.
 *
 * Usage in Markdoc:
 *   Inline: {% math %}E = mc^2{% /math %}
 *   Display: {% math display=true %}\int_0^\infty e^{-x^2} dx{% /math %}
 */
export function KaTeX({ math, display = false }: KaTeXProps) {
  const html = useMemo(() => {
    if (!math) return "";

    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
        output: "htmlAndMathml",
        strict: false,
      });
    } catch (err) {
      console.error("KaTeX render error:", err, "Math content:", math);
      return `<span class="katex-error">${math}</span>`;
    }
  }, [math, display]);

  if (display) {
    return (
      <div
        className="katex-display"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span className="katex-inline" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
