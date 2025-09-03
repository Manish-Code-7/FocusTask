import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Next App",
  description: "A simple Next.js layout",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
