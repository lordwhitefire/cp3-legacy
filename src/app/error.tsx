"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error("Root error:", error); }, [error]);
  return (
    <div className="error-wrapper" style={{ textAlign: "center", padding: "100px 20px" }}>
      <h1 style={{ color: "#f9a825" }}>Something went wrong</h1>
      <p style={{ marginBottom: 20 }}>An unexpected error occurred.</p>
      <button className="btn btn-primary" onClick={() => reset()}>Try again</button>
    </div>
  );
}
