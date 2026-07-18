import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout securely — COD, UPI, and card available across India.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
