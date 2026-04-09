import type { Metadata } from "next"
import { Inter, Courier_Prime } from "next/font/google"
import "./globals.css"
import "streamdown/styles.css"
import { Providers } from "./providers"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const courierPrime = Courier_Prime({
  weight: "400",
  variable: "--font-screenplay",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Guion Cinematográfico AI",
  description:
    "Editor de guiones Fountain con modificadores cinematográficos e IA (OpenRouter).",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${courierPrime.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${courierPrime.variable} min-h-full flex flex-col`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
