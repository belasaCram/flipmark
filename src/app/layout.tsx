import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Header } from "@/components/Header";
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
  title: "Flipmark",
  description: "Study Markdown decks as 3D flashcards and quizzes.",
};

// Runs before first paint so a saved theme never flashes the wrong colours.
const applySavedTheme = `try{var t=localStorage.getItem("flipmark-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Script id="apply-saved-theme" strategy="beforeInteractive">
          {applySavedTheme}
        </Script>
        <Header />
        {children}
      </body>
    </html>
  );
}
