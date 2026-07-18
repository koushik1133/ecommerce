import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size guide",
  description: "brand T-shirt size guide in cm — find your fit.",
};

const ROWS = [
  { size: "XS", chest: "86–91", length: "66", shoulder: "40" },
  { size: "S", chest: "91–96", length: "69", shoulder: "42" },
  { size: "M", chest: "96–101", length: "72", shoulder: "44" },
  { size: "L", chest: "101–106", length: "74", shoulder: "46" },
  { size: "XL", chest: "106–112", length: "76", shoulder: "48" },
  { size: "XXL", chest: "112–118", length: "78", shoulder: "50" },
];

export default function SizeGuidePage() {
  return (
    <div className="container-brand py-10 md:py-16 max-w-3xl">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted mb-2">
        Fit
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
        Size guide
      </h1>
      <p className="mt-4 text-muted leading-relaxed">
        Measurements in centimetres. Chest is garment circumference. If you are
        between sizes, size up for Everyday Crew and Softwash V; stay true for
        Heavyweight Box if you want the intended oversized look.
      </p>

      <div className="mt-10 overflow-x-auto border border-line">
        <table className="w-full text-sm text-left min-w-[480px]">
          <thead className="bg-surface text-xs tracking-[0.14em] uppercase text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Chest</th>
              <th className="px-4 py-3 font-medium">Length</th>
              <th className="px-4 py-3 font-medium">Shoulder</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.size} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{row.size}</td>
                <td className="px-4 py-3">{row.chest}</td>
                <td className="px-4 py-3">{row.length}</td>
                <td className="px-4 py-3">{row.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-8 space-y-2 text-sm text-muted">
        <li>· Lay a favourite tee flat and compare length and chest.</li>
        <li>· Fabric may shrink ~2% after the first wash — we pre-shrink where possible.</li>
        <li>· Need help? Email hello@brand.in with your height and usual size.</li>
      </ul>
    </div>
  );
}
