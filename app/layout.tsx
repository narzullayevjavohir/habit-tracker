// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import NavigationBar from "../components/special-components/navigation-bar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Habit Tracker - Build Better Habits",
  description: "Track your habits and build a better life one day at a time",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className} suppressHydrationWarning>
          {user && <NavigationBar />}
          <main className={user ? "min-h-screen bg-gray-50" : ""}>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
