import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "LinkedIn PDF Resume Builder",
  description:
    "Upload a LinkedIn PDF export, convert it into JSON Resume, and render an ATS-ready PDF in the target koriel.kr format.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

