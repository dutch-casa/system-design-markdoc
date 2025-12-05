import React from "react";

interface MermaidErrorBoundaryProps {
  children: React.ReactNode;
  chart: string;
}

interface MermaidErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class MermaidErrorBoundary extends React.Component<
  MermaidErrorBoundaryProps,
  MermaidErrorBoundaryState
> {
  constructor(props: MermaidErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: unknown): MermaidErrorBoundaryState {
    let errorMessage = "An error occurred while rendering the diagram";
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = String(error);
    }
    return { hasError: true, errorMessage };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Mermaid ErrorBoundary caught an error:", errorMessage);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="diagram-error">
          <p className="diagram-error-title">Diagram Error</p>
          <pre className="diagram-error-message">{this.state.errorMessage}</pre>
          <details className="diagram-error-details">
            <summary>Source</summary>
            <pre className="diagram-error-source">{this.props.chart}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
