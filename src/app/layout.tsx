import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { SessionProviderWrapper } from "@/components/auth/SessionProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AAW GarageFlow - US Dealer Work Orders & Maintenance",
  description: "Automotive Shop Work Order and Recurring Maintenance Tracking System for US Dealership Fleets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </main>
            <footer className="border-t py-4 text-center text-xs text-muted-foreground">
              AAW GarageFlow &copy; {new Date().getFullYear()} - 100% US Automotive Terminology & Clean Architecture Standards
            </footer>
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
