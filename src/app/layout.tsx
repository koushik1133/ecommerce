import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import { StoreShell } from "@/components/StoreShell";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "brand — Coming Soon | Premium T-shirts India",
    template: "%s · brand",
  },
  description:
    "brand is an India-first T-shirt label. Shop early-access tees, customize your logo, and get pan-India delivery with COD.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
