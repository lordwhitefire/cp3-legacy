import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for CP3 Legacy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: "80px 20px", maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ color: "#f9a825", marginBottom: 30 }}>Privacy Policy</h1>
      <p><strong>Last updated:</strong> July 2026</p>

      <h2>Data We Collect</h2>
      <p>CP3 Legacy uses <strong>Vercel Analytics</strong> to collect anonymized page views and Core Web Vitals (loading speed, interactivity, layout stability). This data is collected at the CDN level — no cookies, no personal data, no JavaScript loaded on your device. It cannot be used to identify you.</p>
      <p>We do <strong>not</strong> collect: names, email addresses, IP addresses, cookies, location data, or any personally identifiable information. There are no user accounts, no contact forms, and no comment sections.</p>

      <h2>Data Sharing</h2>
      <p>We do not sell, share, or transfer your data to third parties. Vercel (our hosting provider) processes anonymized analytics data on our behalf. No other third-party services have access.</p>

      <h2>Your Rights</h2>
      <p>Under GDPR, you have the right to access, correct, delete, or port any personal data we hold. Since we collect no personal data, there is nothing to access or delete. If this changes in the future, this policy will be updated and you will be informed.</p>

      <h2>Contact</h2>
      <p>For privacy-related questions, open an issue at <a href="https://github.com/lordwhitefire/CP3-Legacy">github.com/lordwhitefire/CP3-Legacy</a>.</p>
    </div>
  );
}
