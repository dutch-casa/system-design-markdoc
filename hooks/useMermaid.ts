import { useQuery } from "@tanstack/react-query";

export type MermaidTheme = "default" | "dark";

/**
 * Renders mermaid diagram in an isolated iframe to avoid React DOM serialization issues.
 * Uses React Query for caching and race handling.
 */
async function renderMermaidInIframe(
  chart: string,
  theme: MermaidTheme
): Promise<string> {
  if (!chart || typeof window === "undefined") return "";

  return new Promise((resolve, reject) => {
    const messageId = `mermaid-${Math.random().toString(36).slice(2, 11)}`;

    // Detect chart types that don't use ELK layout
    // Check first non-empty line for chart type (case-insensitive)
    const chartLines = chart.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const firstLine = chartLines.length > 0 ? chartLines[0].toLowerCase() : '';
    const isGantt = firstLine.startsWith('gantt');
    const isPie = firstLine.startsWith('pie');

    // Create isolated iframe
    // Gantt charts need proper width for layout calculations
    const iframe = document.createElement("iframe");
    if (isGantt) {
      iframe.style.cssText =
        "position:absolute;left:-9999px;top:-9999px;width:1200px;height:600px;visibility:hidden";
    } else {
      iframe.style.cssText =
        "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;visibility:hidden";
    }
    document.body.appendChild(iframe);

    // Cleanup function
    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      iframe.remove();
    };

    // Listen for response with matching messageId
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.messageId !== messageId) return;

      cleanup();

      if (event.data.type === "mermaid-success") {
        resolve(event.data.svg);
      } else {
        reject(new Error(event.data.message || "Mermaid render failed"));
      }
    };

    window.addEventListener("message", handleMessage);

    // Timeout after 10s
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Mermaid render timeout"));
    }, 10000);

    // Write iframe content
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      cleanup();
      clearTimeout(timeout);
      reject(new Error("Cannot access iframe document"));
      return;
    }

    const needsElk = !isGantt && !isPie;

    // Build config object conditionally
    const configParts = [
      `startOnLoad: false`,
      `theme: ${JSON.stringify(theme)}`,
      `securityLevel: 'loose'`,
    ];
    
    if (needsElk) {
      configParts.push(`layout: 'elk'`);
    }
    
    configParts.push(`flowchart: { useMaxWidth: true, htmlLabels: true }`);
    configParts.push(`stateDiagram: { useMaxWidth: true }`);
    configParts.push(`stateDiagramV2: { useMaxWidth: true }`);
    configParts.push(`gantt: { useMaxWidth: true }`);

    const html = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
${needsElk ? `import elkLayouts from 'https://cdn.jsdelivr.net/npm/@mermaid-js/layout-elk@0/dist/mermaid-layout-elk.esm.min.mjs';

await mermaid.registerLayoutLoaders(elkLayouts);` : ''}
mermaid.initialize({
  ${configParts.join(',\n  ')}
});

const chart = ${JSON.stringify(chart)};
const id = 'mermaid-' + Math.random().toString(36).slice(2, 11);
const messageId = ${JSON.stringify(messageId)};

try {
  const { svg } = await mermaid.render(id, chart);
  window.parent.postMessage({ type: 'mermaid-success', svg, messageId }, '*');
} catch (err) {
  const errorMsg = err.message || String(err);
  console.error('Mermaid render error:', errorMsg, 'Chart:', chart.substring(0, 100));
  window.parent.postMessage({ type: 'mermaid-error', message: errorMsg, messageId }, '*');
}
</script>
</head><body></body></html>`;

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
  });
}

export function useMermaid(chart: string, theme: MermaidTheme = "default", enabled: boolean = true) {
  const query = useQuery({
    queryKey: ["mermaid", chart, theme],
    queryFn: () => renderMermaidInIframe(chart, theme),
    enabled: enabled && !!chart && typeof window !== "undefined",
    staleTime: Infinity,
    retry: false,
  });

  return {
    svg: query.data ?? null,
    error: query.error?.message ?? null,
    isPending: query.isPending,
  };
}
