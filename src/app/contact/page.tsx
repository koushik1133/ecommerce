import type { Metadata } from "next";
import ContactPage from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact brand — sizing, logos, wholesale, and launch updates.",
};

export default function Page() {
  return <ContactPage />;
}
