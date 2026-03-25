import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://civicos.systems/"),
  title: "CivicOS National | AI-Powered Public Infrastructure India",
  description: "The unified platform for National civic services. Report issues, track resolutions, and connect directly with government departments in real-time.",
  keywords: ["CivicOS", "National Public Infrastructure", "Government Services India", "Citizen Empowerment", "AI-Powered CRM"],
  authors: [{ name: "CivicOS National" }],
  openGraph: {
    title: "CivicOS National | Empowering Citizens, Building a Smarter India",
    description: "Official AI-Powered PS-CRM for India - Building a Smarter, Cleaner Country.",
    url: "https://civicos.systems/",
    siteName: "CivicOS National",
    locale: "en_IN",
    type: "website",
    images: [{
      url: "/favicon.ico",
      width: 32,
      height: 32,
      alt: "CivicOS National Logo"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CivicOS National",
    description: "Official AI-Powered PS-CRM for India - Building a Smarter, Cleaner Country.",
    images: ["/favicon.ico"],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  alternates: {
    canonical: "https://civic-os-five.vercel.app",
  },
};

import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${roboto.variable} antialiased overflow-x-hidden`}>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
