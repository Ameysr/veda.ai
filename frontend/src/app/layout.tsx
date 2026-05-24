import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: "VedaAI | Assignments",
  description: "Manage and create assignments for your classes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSans.variable} bg-surface-main font-sans text-ink-main antialiased`}
      >
        <div className="flex min-h-screen w-full">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex w-full flex-col sm:ml-64">
            <TopHeader />
            <main className="flex-1 pb-20 sm:pb-0">{children}</main>
          </div>

          {/* Mobile Bottom Navigation */}
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
