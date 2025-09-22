import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HabitTracker - Build Better Habits",
  description:
    "Track your habits, build consistency, and achieve your goals with our beautiful habit tracking platform.",
  keywords: [
    "habits",
    "productivity",
    "goal tracking",
    "self improvement",
    "wellness",
  ],
  authors: [{ name: "HabitTracker Team" }],
  creator: "HabitTracker",
  publisher: "HabitTracker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://habit-tracker.vercel.app"),
  openGraph: {
    title: "HabitTracker - Build Better Habits",
    description:
      "Track your habits, build consistency, and achieve your goals with our beautiful habit tracking platform.",
    url: "https://habit-tracker.vercel.app",
    siteName: "HabitTracker",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HabitTracker - Build Better Habits",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HabitTracker - Build Better Habits",
    description:
      "Track your habits, build consistency, and achieve your goals with our beautiful habit tracking platform.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
