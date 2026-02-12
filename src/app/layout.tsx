import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI News Hub - AIの最新ニュースを一覧で",
  description: "OpenAI、Google、Anthropicなど、AIに関する最新ニュースを自動収集してお届けします",
  keywords: ["AI", "人工知能", "ChatGPT", "Claude", "Gemini", "ニュース"],
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased mesh-gradient min-h-screen`}
      >
        <ThemeProvider>
          <Header />
          <main className="max-w-5xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="glass border-t border-white/10 mt-16">
            <div className="max-w-5xl mx-auto px-4 py-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    AI
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    AI News Hub
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  RSSフィードから最新AI情報を自動収集
                </p>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
