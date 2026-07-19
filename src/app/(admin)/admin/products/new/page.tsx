"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { useAdminProducts } from "@/store/admin";

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useAdminProducts();
  const [saving, setSaving] = useState(false);

  const handleSave = (data: Parameters<typeof addProduct>[0]) => {
    setSaving(true);
    // Simulate brief async
    setTimeout(() => {
      addProduct(data);
      setSaving(false);
      router.push("/admin/products");
    }, 600);
  };

  return <ProductForm title="New Product" onSave={handleSave} saving={saving} />;
}
