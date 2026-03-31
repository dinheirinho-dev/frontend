import "./globals.css";
import type { Metadata, Viewport } from "next";
export const dynamic = "force-dynamic";
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: "Dinheirinho - Seu Controle Financeiro Simples",
    template: "%s | Dinheirinho",
  },
  description: "Gerencie suas finanças, acompanhe dividendos e alcance suas metas com o Dinheirinho. Simples, rápido e eficiente.",
  keywords: ["finanças", "controle financeiro", "investimentos", "dividendos", "gastos", "orçamento"],
  authors: [{ name: "Robert Sampaio" }],
  creator: "Robert Sampaio",
  // icons: {
  //   icon: "/favicon.ico", // Garante que você tenha um favicon na pasta /public
  //   apple: "/apple-touch-icon.png",
  // },
  // openGraph: {
  //   type: "website",
  //   locale: "pt_BR",
  //   url: "https://www.dinheirinho.dev.br",
  //   title: "Dinheirinho - Gestão Financeira Inteligente",
  //   description: "Organize sua vida financeira em poucos cliques. Grátis e fácil de usar.",
  //   siteName: "Dinheirinho",
  //   images: [
  //     {
  //       url: "https://www.dinheirinho.dev.br/og-image.png", // Uma imagem 1200x630 do seu dashboard
  //       width: 1200,
  //       height: 630,
  //       alt: "Dinheirinho Dashboard",
  //     },
  //   ],
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Dinheirinho",
  //   description: "Seu controle financeiro na palma da mão.",
  //   images: ["https://www.dinheirinho.dev.br/og-image.png"],
  // },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" suppressHydrationWarning>
        <head>
          {/* Anti-FOUC: aplica tema salvo antes do render */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                if (theme !== 'light') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `}} />
        </head>
        <body className="bg-gray-50 dark:bg-gray-900 antialiased min-h-screen transition-colors duration-200">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
