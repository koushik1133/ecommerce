"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, MoreVertical, Pencil, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { useAdminProducts } from "@/store/admin";
import { formatINR } from "@/lib/products";

const CATEGORIES = ["all", "essentials", "graphics", "premium"] as const;

export default function ProductsPage() {
  const { products, deleteProduct, duplicateProduct, updateProduct } = useAdminProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        const matchCat = category === "all" || p.category === category;
        const matchSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      })
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  }, [products, search, category]);

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setConfirmDelete(null);
    setOpenMenu(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#6b6b6b] text-sm">{products.length} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#0f0f14] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2a2a2a] transition"
        >
          <Plus size={16} />
          Add product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#e2e2df] rounded-xl px-3 py-2.5 flex-1 max-w-sm">
          <Search size={15} className="text-[#9b9b9b] flex-shrink-0" />
          <input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent text-[#0f0f14] placeholder:text-[#9b9b9b]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition capitalize ${
                category === cat
                  ? "bg-[#0f0f14] text-white"
                  : "bg-white border border-[#e2e2df] text-[#6b6b6b] hover:bg-[#f0f0ee]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e8e8e5] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e8e5] bg-[#fafaf9]">
                {["Product", "Category", "Price", "Colors", "Status", "Priority", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[#9b9b9b] text-xs font-semibold uppercase tracking-wider px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[#9b9b9b]">
                    No products found.
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[#f0f0ee] last:border-0 hover:bg-[#fafafa] transition-colors"
                >
                  {/* Product */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm"
                        style={{ background: p.colors[0]?.hex ?? "#1A1A1A" }}
                      >
                        {p.name[0]}
                      </div>
                      <div>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-[#0f0f14] font-semibold hover:text-[#0f6e56] transition"
                        >
                          {p.name}
                        </Link>
                        <p className="text-[#9b9b9b] text-xs">{p.tagline}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4">
                    <span className="capitalize text-[#6b6b6b] text-xs font-medium bg-[#f0f0ee] px-2.5 py-1 rounded-full">
                      {p.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4">
                    <div>
                      <span className="text-[#0f0f14] font-semibold">{formatINR(p.price)}</span>
                      {p.compareAt && (
                        <span className="text-[#9b9b9b] text-xs line-through ml-1.5">{formatINR(p.compareAt)}</span>
                      )}
                    </div>
                  </td>

                  {/* Colors */}
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      {p.colors.slice(0, 5).map((c) => (
                        <div
                          key={c.slug}
                          title={c.name}
                          className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                          style={{ background: c.hex }}
                        />
                      ))}
                      {p.colors.length > 5 && (
                        <span className="text-[#9b9b9b] text-xs">+{p.colors.length - 5}</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {p.comingSoon ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                        Coming Soon
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
                        Active
                      </span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="px-5 py-4">
                    <input
                      type="number"
                      value={p.priority ?? 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        updateProduct(p.id, { priority: isNaN(val) ? 0 : val });
                      }}
                      className="w-16 border border-[#e2e2df] px-2.5 py-1.5 rounded-xl text-center font-medium bg-transparent text-[#0f0f14]"
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        title="View in store"
                        className="p-1.5 rounded-lg text-[#9b9b9b] hover:text-[#0f0f14] hover:bg-[#f0f0ee] transition"
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}`}
                        title="Edit"
                        className="p-1.5 rounded-lg text-[#9b9b9b] hover:text-[#0f0f14] hover:bg-[#f0f0ee] transition"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        title="Duplicate"
                        onClick={() => { duplicateProduct(p.id); setOpenMenu(null); }}
                        className="p-1.5 rounded-lg text-[#9b9b9b] hover:text-[#0f0f14] hover:bg-[#f0f0ee] transition"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setConfirmDelete(p.id)}
                        className="p-1.5 rounded-lg text-[#9b9b9b] hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-[#0f0f14] font-bold text-lg mb-2">Delete product?</h3>
            <p className="text-[#6b6b6b] text-sm mb-6">
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2e2df] text-[#0f0f14] text-sm font-medium hover:bg-[#f0f0ee] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
