import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Reclaim - Focus Tracker",
  description: "Take back control of your time with AI-powered insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
