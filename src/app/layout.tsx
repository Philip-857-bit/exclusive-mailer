import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from '@/components/Sidebar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exclusive Mail - Automated Email Campaigns",
  description: "Manage contacts and send targeted email campaigns efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <div className="flex min-h-screen bg-[#f8fafc]">
          {/* Sidebar only renders on client, but for layout we verify path or use css hidden on mobile */}
          <Sidebar />
          {/* Main content adjusts: mobile full width (pl-0), desktop starts at collapsed width (pl-20 approx 80px) 
              If user expands sidebar, it currently overlays. For full push, we'd need a Context. 
              Given "Collapsible Default", overlaying on expand is a common pattern for mini-sidebars. 
          */}
          <main className="flex-1 min-h-screen w-full relative transition-all duration-300 md:pl-20 pt-16 md:pt-0">
            {/* Added pt-16 for mobile header space if needed, or handled by page content */}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
