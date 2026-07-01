export default function NotFound() {
  return (
    <div className="error-wrapper" style={{ textAlign: "center", padding: "100px 20px" }}>
      <h1 style={{ fontSize: "3rem", color: "#f9a825" }}>404</h1>
      <p>Page not found — the article may have moved or never existed.</p>
      <a href="/" className="btn btn-primary">Back to Home</a>
    </div>
  );
}
