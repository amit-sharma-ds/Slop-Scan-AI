import "./globals.css";
import "./polish.css";

export const metadata = {
  title: "SlopScan AI Pro",
  description: "AI review quality intelligence for GitHub pull requests"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
