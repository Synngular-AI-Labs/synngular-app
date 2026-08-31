import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

// Without this, an uncaught render error anywhere in the tree unmounts the whole
// app, leaving only the plain background from index.html — indistinguishable from
// a native WebView crash-reload, and with no clue what actually broke.
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Uncaught render error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            background: "var(--grey-100, #fff)",
            color: "var(--grey-1000, #111)",
          }}
        >
          <p style={{ fontSize: "1rem", fontWeight: 600 }}>Something went wrong</p>
          <p style={{ fontSize: "0.8rem", color: "var(--grey-700, #555)", maxWidth: "24rem" }}>
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--purple-1000, #6d28d9)",
              color: "var(--purple-1000, #6d28d9)",
              background: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
