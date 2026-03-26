import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Provider from "@/components/Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Golfying",
  description: "Real-time overview of revenue and charitable impact.",
  // icons: {
  //   other: [
  //     { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
  //     { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
  //   ],
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
