import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import StoreProvider from "@/store/StoreProvider";
import FloatingStars from "@/components/FloatingStars";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Character Matters - Building Character in Children",
  description: "Character Matters Concept is an organization envisioned to raise the standard of good character and sound morals in children and young adolescents through trainings, TV shows, and character building books.",
  keywords: "character education, children, morals, values, books, trainings, TV shows",
  icons: {
    icon: '/images/logo-icon.jpg',
    apple: '/images/logo-icon.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-comic min-h-screen bg-soft-hero">
        <StoreProvider>
          <FloatingStars count={15} />
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="relative z-10 flex-1">{children}</main>
            <Footer />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
