"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { LiveTelemetryTracker } from "@/components/LiveTelemetryTracker";
import { FloatingAIAgent } from "@/components/FloatingAIAgent";

export function StoreShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Suspense fallback={null}>
        <LiveTelemetryTracker />
        <FloatingAIAgent />
      </Suspense>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
