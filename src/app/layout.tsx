import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/config/site";

export const metadata: Metadata={
  title: { default: `${site.name} — Learn at your own pace`, template: `%s | ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en">
    <body>{children}</body>
  </html>;
}
