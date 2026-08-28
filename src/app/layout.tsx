import type { Metadata } from "next";
import "./globals.css";
import { Hanken_Grotesk, Inter } from "next/font/google";
import { SessionWrapper } from '@/components/session-wrapper';

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MarDocs - Your Documents. Now Intelligent.",
  description: "AI-powered document analysis and conversation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${inter.variable}`}>
      <body className="bg-[#111415] text-[#e1e3e4] font-sans min-h-screen">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
