import type { Metadata } from "next";
import { 
  Space_Mono,
  Merriweather,
  Lora,
  Crimson_Text,
  Libre_Baskerville,
  EB_Garamond,
  Open_Sans,
  Roboto,
  Inter,
} from "next/font/google";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

const lora = Lora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const crimson = Crimson_Text({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const openSans = Open_Sans({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "wnreader",
  description: "A distraction-free webnovel reader for imported EPUB files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${mono.variable} ${merriweather.variable} ${lora.variable} ${crimson.variable} ${libreBaskerville.variable} ${ebGaramond.variable} ${openSans.variable} ${roboto.variable} ${inter.variable} antialiased`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
