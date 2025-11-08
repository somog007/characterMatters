import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import StoreProvider from "@/store/StoreProvider";
import FloatingStars from "@/components/FloatingStars";

const comicNeue = Comic_Neue({
  weight: ['300', '400', '700'],
  subsets: ["latin"],
  variable: "--font-comic",
});

export const metadata: Metadata = {
  title: "Character Matters - Building Character in Children",
  description: "Character Matters Concept is an organization envisioned to raise the standard of good character and sound morals in children and young adolescents through trainings, TV shows, and character building books.",
  keywords: "character education, children, morals, values, books, trainings, TV shows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${comicNeue.variable} font-comic min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100`}>
        <StoreProvider>
          <FloatingStars count={15} />
          <Header />
          <main className="relative z-10">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
