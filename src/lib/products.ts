export type ProductColor = {
  name: string;
  hex: string;
  slug: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAt?: number;
  colors: ProductColor[];
  sizes: string[];
  fabric: string;
  fit: string;
  features: string[];
  badges?: string[];
  comingSoon?: boolean;
  category: "essentials" | "graphics" | "premium";
  /** Public paths to ordered 360° frames. If 2+, photo-spin viewer is used. */
  spinFrames?: string[];
  /** Product photo gallery */
  gallery?: { src: string; label: string }[];
  /** Prefer photos | 360 | 3d */
  viewer?: "photos" | "spin" | "3d" | "auto";
  garmentCategory?: "T-Shirts" | "Pants" | "Caps" | "Hoodies/Sweatshirts";
  garmentType?: string;
  priority?: number;
  backgroundMode?: "light" | "dark" | "darken";
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const GARMENT_CATEGORIES = {
  "T-Shirts": ["Oversized T-Shirt", "Regular T-Shirt", "Cropped Boxy T-Shirt", "Hanging T-Shirt"],
  "Pants": ["Sweatpants"],
  "Caps": ["Cap"],
  "Hoodies/Sweatshirts": ["Oversized Sweatshirt", "Oversized Hoodie", "Hanging Hoodie", "Oversized Polo Shirt", "Zip Hoodie"]
} as const;

export const PRESET_COLORS: ProductColor[] = [
  { name: "Ink", hex: "#1A1A1A", slug: "ink" },
  { name: "Chalk", hex: "#F2F0EB", slug: "chalk" },
  { name: "Forest", hex: "#1F4D3A", slug: "forest" },
  { name: "Ocean", hex: "#1B3A4B", slug: "ocean" },
  { name: "Rust", hex: "#A84B2F", slug: "rust" },
  { name: "Fog", hex: "#C8C5BE", slug: "fog" },
  { name: "Navy", hex: "#1B2A41", slug: "navy" },
];

export const LOGO_PRESETS = [
  {
    id: "wordmark",
    name: "Wordmark",
    label: "brand",
  },
  {
    id: "mark",
    name: "Mark",
    label: "B",
  },
  {
    id: "stamp",
    name: "Stamp",
    label: "BRAND®",
  },
  {
    id: "script",
    name: "Script",
    label: "brand.",
  },
] as const;

export type LogoPlacement = "chest-left" | "chest-center" | "back";

export const LOGO_PLACEMENTS: { id: LogoPlacement; label: string }[] = [
  { id: "chest-left", label: "Chest left" },
  { id: "chest-center", label: "Chest center" },
  { id: "back", label: "Back print" },
];

export const products: Product[] = [
  {
    id: "0",
    slug: "studio-tee",
    name: "Studio Tee",
    tagline: "Ganesha embroidered drop.",
    description:
      "A black cotton crew with gold Ganesha embroidery on the chest. Customize colour and logo on the 360° object, then browse all ten studio photos.",
    price: 1499,
    compareAt: 1899,
    colors: [
      { name: "Ink", hex: "#1A1A1A", slug: "ink" },
      { name: "Chalk", hex: "#F2F0EB", slug: "chalk" },
      { name: "Forest", hex: "#1F4D3A", slug: "forest" },
      { name: "Ocean", hex: "#1B3A4B", slug: "ocean" },
      { name: "Bone", hex: "#E8E4DC", slug: "bone" },
    ],
    sizes: [...SIZES],
    fabric: "100% cotton, 200 GSM",
    fit: "Regular",
    features: [
      "Gold Ganesha chest embroidery",
      "10-photo studio gallery",
      "Interactive 360° object",
      "Pan-India shipping",
    ],
    badges: ["New drop"],
    category: "premium",
    garmentCategory: "T-Shirts",
    garmentType: "Regular T-Shirt",
    viewer: "photos",
    priority: 1,
    gallery: [
      { src: "/products/studio-tee/gallery/front-clean.jpg", label: "Front" },
      { src: "/products/studio-tee/gallery/back-clean.jpg", label: "Back" },
      { src: "/products/studio-tee/gallery/right-side-clean.jpg", label: "Right side" },
      { src: "/products/studio-tee/gallery/left-side-clean.jpg", label: "Left side" },
      { src: "/products/studio-tee/gallery/flat-lay-clean.jpg", label: "Flat lay" },
      { src: "/products/studio-tee/gallery/embroidery-closeup-clean.jpg", label: "Embroidery" },
      { src: "/products/studio-tee/gallery/neck-closeup-clean.jpg", label: "Neck" },
      { src: "/products/studio-tee/gallery/sleeve-closeup-clean.jpg", label: "Sleeve" },
      { src: "/products/studio-tee/gallery/hem-closeup-clean.jpg", label: "Hem" },
      { src: "/products/studio-tee/gallery/on-model-clean.jpg", label: "On model" },
    ],
    spinFrames: [
      "/products/studio-tee/spin/final/01.jpg",
      "/products/studio-tee/spin/final/02.jpg",
      "/products/studio-tee/spin/final/03.jpg",
      "/products/studio-tee/spin/final/04.jpg",
      "/products/studio-tee/spin/final/05.jpg",
      "/products/studio-tee/spin/final/06.jpg",
      "/products/studio-tee/spin/final/07.jpg",
      "/products/studio-tee/spin/final/08.jpg",
    ],
  },
  {
    id: "1",
    slug: "everyday-crew",
    name: "Everyday Crew",
    tagline: "Your daily uniform.",
    description:
      "A midweight cotton crew built for Indian weather — soft hand-feel, clean silhouette, and a cut that stays sharp after every wash. Ideal for office-to-weekend rotation.",
    price: 999,
    compareAt: 1299,
    colors: [
      { name: "Ink", hex: "#1A1A1A", slug: "ink" },
      { name: "Chalk", hex: "#F2F0EB", slug: "chalk" },
      { name: "Forest", hex: "#1F4D3A", slug: "forest" },
      { name: "Clay", hex: "#8B5A3C", slug: "clay" },
    ],
    sizes: [...SIZES],
    fabric: "100% combed cotton, 180 GSM",
    fit: "Regular — true to size",
    features: [
      "Pre-shrunk fabric",
      "Reinforced shoulder seams",
      "Breathable midweight knit",
      "Ships across India in 3–5 days",
    ],
    badges: ["Bestseller"],
    category: "essentials",
    garmentCategory: "T-Shirts",
    garmentType: "Regular T-Shirt",
    priority: 2,
  },
  {
    id: "2",
    slug: "heavyweight-box",
    name: "Heavyweight Box",
    tagline: "Structured. Substantial.",
    description:
      "A boxy heavyweight tee with a dropped shoulder and denser knit. Holds logo prints cleanly and drapes with intentional volume — the piece for statement branding.",
    price: 1499,
    compareAt: 1799,
    colors: [
      { name: "Ink", hex: "#1A1A1A", slug: "ink" },
      { name: "Fog", hex: "#C8C5BE", slug: "fog" },
      { name: "Navy", hex: "#1B2A41", slug: "navy" },
      { name: "Bone", hex: "#E8E4DC", slug: "bone" },
    ],
    sizes: [...SIZES],
    fabric: "100% cotton, 240 GSM",
    fit: "Oversized boxy",
    features: [
      "Dense knit for crisp prints",
      "Dropped shoulder",
      "Longer back hem",
      "GST invoice available",
    ],
    badges: ["New"],
    category: "premium",
    garmentCategory: "T-Shirts",
    garmentType: "Oversized T-Shirt",
    priority: 3,
  },
  {
    id: "3",
    slug: "softwash-v",
    name: "Softwash V",
    tagline: "Washed softness.",
    description:
      "Enzyme-washed cotton with a gentle V-neck and lived-in softness from day one. Lightweight enough for humid cities, polished enough for evenings out.",
    price: 1099,
    colors: [
      { name: "Sand", hex: "#D4C4A8", slug: "sand" },
      { name: "Olive", hex: "#5C6B4A", slug: "olive" },
      { name: "Ink", hex: "#1A1A1A", slug: "ink" },
      { name: "White", hex: "#FAFAFA", slug: "white" },
    ],
    sizes: [...SIZES],
    fabric: "100% cotton, 160 GSM enzyme wash",
    fit: "Slim regular",
    features: [
      "Soft enzyme wash",
      "Shaped V-neck",
      "Anti-twist side seams",
      "Easy returns within 7 days",
    ],
    category: "essentials",
    garmentCategory: "T-Shirts",
    garmentType: "Regular T-Shirt",
    priority: 4,
  },
  {
    id: "4",
    slug: "city-stripe",
    name: "City Stripe",
    tagline: "Minimal graphic.",
    description:
      "A clean stripe graphic tee designed in-house. Subtle enough for daily wear, distinctive enough to feel like brand — not merchandise.",
    price: 1199,
    compareAt: 1499,
    colors: [
      { name: "Chalk", hex: "#F2F0EB", slug: "chalk" },
      { name: "Ink", hex: "#1A1A1A", slug: "ink" },
      { name: "Steel", hex: "#4A5560", slug: "steel" },
    ],
    sizes: [...SIZES],
    fabric: "100% cotton, 180 GSM",
    fit: "Regular",
    features: [
      "In-house stripe artwork",
      "Discharge print ready",
      "Custom logo option",
      "Pan-India COD available",
    ],
    badges: ["Limited"],
    category: "graphics",
    garmentCategory: "T-Shirts",
    garmentType: "Regular T-Shirt",
    priority: 5,
  },
  {
    id: "5",
    slug: "monogram-tee",
    name: "Monogram Tee",
    tagline: "Make it yours.",
    description:
      "Built for logo customization. Choose a preset mark or upload yours, place it chest-left, center, or on the back — preview live before you add to cart.",
    price: 1299,
    colors: [
      { name: "Ink", hex: "#1A1A1A", slug: "ink" },
      { name: "Chalk", hex: "#F2F0EB", slug: "chalk" },
      { name: "Forest", hex: "#1F4D3A", slug: "forest" },
      { name: "Rust", hex: "#A84B2F", slug: "rust" },
    ],
    sizes: [...SIZES],
    fabric: "100% combed cotton, 200 GSM",
    fit: "Regular",
    features: [
      "Live logo preview",
      "Upload your mark",
      "3 placement options",
      "Print-ready quality check",
    ],
    badges: ["Customizable"],
    category: "premium",
    garmentCategory: "T-Shirts",
    garmentType: "Regular T-Shirt",
    viewer: "3d",
    priority: 6,
  },
  {
    id: "6",
    slug: "travel-lite",
    name: "Travel Lite",
    tagline: "Packs small. Looks sharp.",
    description:
      "A lighter tee for travel and humid days. Quick-dry feel without looking athletic — the quiet essential for trains, flights, and long city days.",
    price: 899,
    colors: [
      { name: "Sky", hex: "#A8C4C8", slug: "sky" },
      { name: "Ink", hex: "#1A1A1A", slug: "ink" },
      { name: "White", hex: "#FAFAFA", slug: "white" },
      { name: "Sage", hex: "#9AAD9A", slug: "sage" },
    ],
    sizes: [...SIZES],
    fabric: "Cotton blend, 150 GSM",
    fit: "Regular",
    features: [
      "Lightweight travel knit",
      "Wrinkle-resistant finish",
      "Breathable weave",
      "Free shipping over ₹1,999",
    ],
    comingSoon: true,
    category: "essentials",
    garmentCategory: "T-Shirts",
    garmentType: "Regular T-Shirt",
    priority: 7,
  },
  {
    id: "7",
    slug: "restday-sweatpants",
    name: "Restday Sweatpants",
    tagline: "Comfort-first loungewear.",
    description: "Super soft, fleece-lined sweatpants designed for ultimate comfort and casual rest days.",
    price: 1999,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "80% cotton, 20% polyester fleece, 320 GSM",
    fit: "Relaxed fit",
    features: [
      "Elastic waistband with drawcord",
      "Deep side pockets",
      "Ribbed ankle cuffs",
      "Ultra-soft brushed interior",
    ],
    category: "essentials",
    garmentCategory: "Pants",
    garmentType: "Sweatpants",
    viewer: "3d",
    priority: 8,
  },
  {
    id: "8",
    slug: "heavyweight-joggers",
    name: "Heavyweight Joggers",
    tagline: "Thick. Durable. Structured.",
    description: "Premium heavyweight knit joggers that retain their shape and provide a clean, modern silhouette.",
    price: 2499,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% cotton, 400 GSM heavyweight terry",
    fit: "Structured tapered fit",
    features: [
      "Heavyweight loopback cotton",
      "Hidden zip pocket",
      "Metal-tipped drawstrings",
      "Reinforced stitching",
    ],
    category: "premium",
    garmentCategory: "Pants",
    garmentType: "Sweatpants",
    viewer: "3d",
    priority: 9,
  },
  {
    id: "9",
    slug: "cargo-sweatpants",
    name: "Cargo Sweatpants",
    tagline: "Utility meets lounge.",
    description: "Streetwear-inspired cargo sweatpants with spacious utility pockets and a rugged, relaxed look.",
    price: 2299,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% cotton French terry, 350 GSM",
    fit: "Relaxed cargo fit",
    features: [
      "Dual side utility cargo pockets",
      "Ankle toggles for adjustable fit",
      "Embroidered details",
      "Premium metal hardware",
    ],
    category: "graphics",
    garmentCategory: "Pants",
    garmentType: "Sweatpants",
    viewer: "3d",
    priority: 10,
  },
  {
    id: "10",
    slug: "studio-cap",
    name: "Studio Cap",
    tagline: "The essential dad hat.",
    description: "Classic six-panel dad hat with clean lines and adjustable strap, perfect for daily wear.",
    price: 799,
    colors: [...PRESET_COLORS],
    sizes: ["One Size"],
    fabric: "100% organic cotton twill",
    fit: "Adjustable low profile",
    features: [
      "6-panel unstructured design",
      "Embroidered eyelets for breathability",
      "Brass buckle strap closure",
      "Curved visor",
    ],
    category: "essentials",
    garmentCategory: "Caps",
    garmentType: "Cap",
    viewer: "3d",
    priority: 11,
  },
  {
    id: "11",
    slug: "premium-dad-hat",
    name: "Premium Dad Hat",
    tagline: "Elevated headwear.",
    description: "Meticulously crafted from heavy brushed cotton with premium metallic hardware and structured front panels.",
    price: 999,
    colors: [...PRESET_COLORS],
    sizes: ["One Size"],
    fabric: "100% brushed cotton canvas",
    fit: "Adjustable mid profile",
    features: [
      "Structured front panels",
      "Premium metal slide closure",
      "Contrast under-visor",
      "Embossed internal branding",
    ],
    category: "premium",
    garmentCategory: "Caps",
    garmentType: "Cap",
    viewer: "3d",
    priority: 12,
  },
  {
    id: "12",
    slug: "streetwear-snapback",
    name: "Streetwear Snapback",
    tagline: "Bold style. Flat brim.",
    description: "A structured snapback cap with a flat visor and plastic snap closure, built for bold graphics and streetwear style.",
    price: 1199,
    colors: [...PRESET_COLORS],
    sizes: ["One Size"],
    fabric: "80% acrylic, 20% wool blend",
    fit: "Adjustable high profile",
    features: [
      "Structured 6-panel high crown",
      "Flat green under-visor",
      "Classic plastic snapback closure",
      "Perfect for front graphic placement",
    ],
    category: "graphics",
    garmentCategory: "Caps",
    garmentType: "Cap",
    viewer: "3d",
    priority: 13,
  },
  {
    id: "13",
    slug: "warmup-hoodie",
    name: "Warmup Hoodie",
    tagline: "Comfort on demand.",
    description: "A warm, daily-wear pullover hoodie with a spacious double-lined hood and a classic kangaroo pocket.",
    price: 2999,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "80% cotton, 20% polyester, 360 GSM",
    fit: "Relaxed regular fit",
    features: [
      "Double-lined hood with adjustable drawcords",
      "Kangaroo front pouch pocket",
      "Ribbed cuffs and waistband",
      "Brushed fleece interior",
    ],
    category: "essentials",
    garmentCategory: "Hoodies/Sweatshirts",
    garmentType: "Oversized Hoodie",
    viewer: "3d",
    priority: 14,
  },
  {
    id: "14",
    slug: "puff-print-sweatshirt",
    name: "Puff Print Sweatshirt",
    tagline: "3D textured graphic.",
    description: "Designed to showcase textured puff-print artwork. Features a clean crewneck cut and soft organic cotton fabric.",
    price: 2799,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% organic cotton, 340 GSM",
    fit: "Relaxed fit",
    features: [
      "Optimized fabric surface for puff print",
      "Durable flatlock seams",
      "Classic crew neck",
      "Pre-shrunk for shape retention",
    ],
    category: "graphics",
    garmentCategory: "Hoodies/Sweatshirts",
    garmentType: "Oversized Sweatshirt",
    viewer: "3d",
    priority: 15,
  },
  {
    id: "15",
    slug: "premium-zip-hoodie",
    name: "Premium Zip Hoodie",
    tagline: "Double zip convenience.",
    description: "A luxurious heavy knit zip hoodie with a two-way matte black YKK zipper, offering versatility and effortless styling.",
    price: 3499,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% cotton French terry, 420 GSM",
    fit: "Oversized boxy fit",
    features: [
      "Two-way matte black YKK zipper",
      "Heavyweight premium cotton",
      "Seamless side panels",
      "Deep internal pockets",
    ],
    category: "premium",
    garmentCategory: "Hoodies/Sweatshirts",
    garmentType: "Zip Hoodie",
    viewer: "3d",
    priority: 16,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatINR(amount: number) {
  // Stable formatting (avoid locale hydration mismatches)
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export const SHIPPING_FLAT = 79;
export const FREE_SHIPPING_THRESHOLD = 1999;
