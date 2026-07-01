"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[ErrorBoundary${this.props.name ? ` (${this.props.name})` : ""}]:`, error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-placeholder" style={{ padding: 20, textAlign: "center" }}>
          <p>This section is temporarily unavailable.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
