import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reclaim - Phone Addiction Management",
  description: "Take back control of your time",
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
