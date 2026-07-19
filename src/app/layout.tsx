import type { Metadata } from "next";
import { StoreShell } from "@/components/StoreShell";
import "./globals.css";

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
    <html lang="en-IN" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <StoreShell>{children}</StoreShell>
      </body>
    </html>
  );
}
