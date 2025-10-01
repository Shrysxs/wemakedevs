import type { Metadata } from "next";
import "./globals.css";
import AuthShell from "@/components/AuthShell";

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
      <body>
        <AuthShell>
          {children}
        </AuthShell>
      </body>
    </html>
  );
}
