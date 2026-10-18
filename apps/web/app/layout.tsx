import type { Metadata } from "next";
import { arvo, greatVibes } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "SkedgeLife", template: "%s · SkedgeLife" },
  description: "Your page and your schedule, set up from your phone in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${arvo.variable} ${greatVibes.variable}`}>
      <body>{children}</body>
    </html>
  );
}
