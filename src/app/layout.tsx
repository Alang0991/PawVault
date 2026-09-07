import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Providers } from "./providers"
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PawVault - Creator Marketplace for Digital Products",
  description:
    "Discover and buy amazing digital products from talented creators worldwide. 3D models, textures, plugins, and more.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="font-sans">
        <Providers>
          <ThemeProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only absolute z-50 top-4 left-4 bg-accent text-accent-foreground px-4 py-2 rounded-md focus-ring"
            >
              Skip to main content
            </a>
            <Header />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
