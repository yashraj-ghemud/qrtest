import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import IntroAnimation from "@/components/IntroAnimation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QRcraft — AI-Powered QR Code Studio",
  description:
    "Generate, customize, scan, and track beautiful QR codes with AI superpowers. 16 content types, smart design, OCR image-to-QR, analytics, and conversation memory.",
  keywords: [
    "QR code",
    "QR generator",
    "AI QR",
    "QR scanner",
    "QR analytics",
    "vCard QR",
    "WiFi QR",
  ],
  authors: [{ name: "QRcraft" }],
  openGraph: {
    title: "QRcraft — AI-Powered QR Code Studio",
    description:
      "Generate, customize, scan, and track beautiful QR codes with AI superpowers.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QRcraft — AI-Powered QR Code Studio",
    description:
      "Generate, customize, scan, and track beautiful QR codes with AI superpowers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Suppress hydration warnings in development caused by browser extensions */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                console.error = (...args) => {
                  if (
                    typeof args[0] === 'string' &&
                    (args[0].includes('Hydration') || 
                     args[0].includes('hydrated') ||
                     args[0].includes('did not match'))
                  ) {
                    return;
                  }
                  originalError.call(console, ...args);
                };
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <IntroAnimation />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
