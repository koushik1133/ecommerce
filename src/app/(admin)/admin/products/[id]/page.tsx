"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { useAdminProducts } from "@/store/admin";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { products, updateProduct } = useAdminProducts();
  const [saving, setSaving] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[#0f0f14] font-bold text-lg">Product not found</p>
          <button onClick={() => router.push("/admin/products")} className="text-[#0f6e56] text-sm mt-2 hover:underline">
            ← Back to products
          </button>
        </div>
      </div>
    );
  }

  const handleSave = (data: Omit<typeof product, "id">) => {
    setSaving(true);
    setTimeout(() => {
      updateProduct(id, data);
      setSaving(false);
      router.push("/admin/products");
    }, 600);
  };

  return (
    <ProductForm
      title={`Edit: ${product.name}`}
      initial={product}
      onSave={handleSave}
      saving={saving}
    />
  );
}
