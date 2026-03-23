import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Thrift Store | Curated Vintage & Secondhand Fashion",
    template: "%s | Thrift Store",
  },
  description:
    "Discover unique vintage and secondhand clothing, shoes, and accessories. Each piece is one-of-a-kind, carefully curated from the best thrift finds.",
  keywords: [
    "thrift store",
    "vintage clothing",
    "secondhand fashion",
    "sustainable fashion",
    "vintage jackets",
    "thrift finds",
  ],
  authors: [{ name: "Thrift Store" }],
  creator: "Thrift Store",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Thrift Store",
    title: "Thrift Store | Curated Vintage & Secondhand Fashion",
    description:
      "Discover unique vintage and secondhand clothing. Each piece is one-of-a-kind.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thrift Store | Curated Vintage Fashion",
    description:
      "Discover unique vintage and secondhand clothing. Each piece is one-of-a-kind.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#2E2520",
              color: "#FEFDFB",
              border: "none",
            },
          }}
        />
      </body>
    </html>
  );
}
