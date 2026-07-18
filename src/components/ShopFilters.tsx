import Link from "next/link";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "essentials", label: "Essentials" },
  { id: "premium", label: "Premium" },
  { id: "graphics", label: "Graphics" },
];

export function ShopFilters({
  active,
  count,
}: {
  active: string;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-y border-line py-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={f.id === "all" ? "/shop" : `/shop?filter=${f.id}`}
            className={`shrink-0 px-4 py-2 text-sm border transition-colors ${
              active === f.id
                ? "bg-ink text-chalk border-ink"
                : "border-line text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted">{count} product{count === 1 ? "" : "s"}</p>
    </div>
  );
}
