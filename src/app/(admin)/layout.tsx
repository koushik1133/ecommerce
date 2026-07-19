import type { ReactNode } from "react";
import "../globals.css";

export const metadata = {
  title: "Admin — brand",
  robots: { index: false, follow: false },
};

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
