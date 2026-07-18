import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Bag",
  description: "Your brand shopping bag.",
};

export default function CartPage() {
  return <CartClient />;
}
