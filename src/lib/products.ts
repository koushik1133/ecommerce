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
  modelSlug?: string;
};

export function getModelSlugForProduct(product: Product): string {
  if (product.modelSlug) return product.modelSlug;
  const type = product.garmentType || "";
  if (type.includes("Sweatpants")) return "sweatpants";
  if (type.includes("Cap")) return "cap";
  if (type.includes("Zip Hoodie")) return "zip-hoodie";
  if (type.includes("Hanging Hoodie")) return "hanging-hoodie";
  if (type.includes("Hoodie")) return "hoodie";
  if (type.includes("Sweatshirt")) return "sweatshirt";
  if (type.includes("Polo")) return "polo-shirt";
  if (type.includes("Boxy")) return "boxy-tshirt";
  if (type.includes("Hanging")) return "hanging-tshirt";
  if (type.includes("Oversized T-Shirt")) return "oversized-tshirt";
  return "regular-tshirt";
}

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
  // --- T-SHIRTS ---
  {
    id: "oversized-tshirt",
    slug: "oversized-tshirt",
    name: "Heavyweight Oversized Tee",
    tagline: "Heavyweight boxy cut with dropped shoulders.",
    description: "Architectural silhouette cut from 260 GSM organic combed cotton with double-needle stitching and an ultra-soft hand feel.",
    price: 1999,
    compareAt: 2499,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% Organic Cotton, 260 GSM",
    fit: "Oversized boxy fit",
    features: [
      "Heavyweight 260 GSM fabric",
      "Dropped shoulders",
      "Thick 1.25\" ribbed collar",
      "Pre-shrunk to retain shape",
    ],
    category: "essentials",
    garmentCategory: "T-Shirts",
    garmentType: "Oversized T-Shirt",
    modelSlug: "oversized-tshirt",
    viewer: "3d",
    priority: 1,
  },
  {
    id: "regular-tshirt",
    slug: "regular-tshirt",
    name: "Classic Regular Tee",
    tagline: "Classic tailored fit for everyday wear.",
    description: "Versatile medium-weight daily tee crafted with single-jersey combed cotton, tailored sleeves, and taped shoulder seams.",
    price: 1499,
    compareAt: 1799,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% Combed Cotton, 180 GSM",
    fit: "Regular fit",
    features: [
      "Medium weight 180 GSM",
      "Taped neck and shoulders",
      "Ribbed crew collar",
      "Side-seam construction",
    ],
    category: "essentials",
    garmentCategory: "T-Shirts",
    garmentType: "Regular T-Shirt",
    modelSlug: "regular-tshirt",
    viewer: "3d",
    priority: 2,
  },
  {
    id: "boxy-tshirt",
    slug: "boxy-tshirt",
    name: "Cropped Boxy Tee",
    tagline: "Cropped hem with wide torso profile.",
    description: "Modern street profile cut short at the waistline with clean dropped shoulders and raw hem detail for a high-fashion edge.",
    price: 1699,
    compareAt: 1999,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% Heavyweight Cotton, 220 GSM",
    fit: "Cropped boxy fit",
    features: [
      "Cropped waist length",
      "Raw hem detail",
      "Dropped shoulder seams",
      "Breathable high-density weave",
    ],
    category: "graphics",
    garmentCategory: "T-Shirts",
    garmentType: "Cropped Boxy T-Shirt",
    modelSlug: "boxy-tshirt",
    viewer: "3d",
    priority: 3,
  },
  {
    id: "hanging-tshirt",
    slug: "hanging-tshirt",
    name: "Studio Display Hanging Tee",
    tagline: "Fluid drape studio display cut.",
    description: "Studio display edition tee engineered to highlight drape, fabric fold textures, and natural motion dynamics.",
    price: 1799,
    compareAt: 2099,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% Softwash Cotton, 200 GSM",
    fit: "Relaxed hanging fit",
    features: [
      "Fluid drape construction",
      "Softwash enzyme treatment",
      "Reinforced collar binding",
      "Unrestricted side motion",
    ],
    category: "premium",
    garmentCategory: "T-Shirts",
    garmentType: "Hanging T-Shirt",
    modelSlug: "hanging-tshirt",
    viewer: "3d",
    priority: 4,
  },
  {
    id: "everyday-crew",
    slug: "everyday-crew",
    name: "Everyday Crew Tee",
    tagline: "Essential crewneck cut for clean daily layering.",
    description: "Lightweight, ultra-breathable crew tee designed for effortless everyday wear and custom brand placement.",
    price: 1299,
    compareAt: 1599,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% Ring-Spun Cotton, 170 GSM",
    fit: "Tailored crew fit",
    features: [
      "Ring-spun ultra-soft touch",
      "Twin-needle hem stitching",
      "Pre-laundered fabric",
      "Tagless neck print",
    ],
    category: "essentials",
    garmentCategory: "T-Shirts",
    garmentType: "Regular T-Shirt",
    modelSlug: "regular-tshirt",
    viewer: "3d",
    priority: 5,
  },

  // --- PANTS / SWEATPANTS ---
  {
    id: "restday-sweatpants",
    slug: "restday-sweatpants",
    name: "Restday Fleece Sweatpants",
    tagline: "Heavyweight fleece joggers with cuffed ankles.",
    description: "Restday sweatpants cut from 340 GSM heavy fleece with an elastic drawcord waistband, deep side pockets, and cuffed leg openings.",
    price: 2499,
    compareAt: 2999,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "80% Organic Cotton, 20% Fleece, 340 GSM",
    fit: "Relaxed tapered fit",
    features: [
      "Elastic waistband with custom drawstrings",
      "Cuffed ankle hems",
      "Deep side-seam zipper pockets",
      "Rear patch pocket",
    ],
    category: "essentials",
    garmentCategory: "Pants",
    garmentType: "Sweatpants",
    modelSlug: "sweatpants",
    viewer: "3d",
    priority: 6,
  },
  {
    id: "heavyweight-joggers",
    slug: "heavyweight-joggers",
    name: "Heavyweight Studio Joggers",
    tagline: "Plush organic cotton joggers built for studio comfort.",
    description: "Ultra-heavyweight 380 GSM fleece joggers engineered with reinforced knee paneling and heavy metal drawstring tips.",
    price: 2799,
    compareAt: 3299,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% French Terry Organic Cotton, 380 GSM",
    fit: "Structured jogger fit",
    features: [
      "Heavy metal drawstring aglets",
      "Reinforced knee seam detail",
      "Double back welt pockets",
      "Ribbed ankle cuffs",
    ],
    category: "premium",
    garmentCategory: "Pants",
    garmentType: "Sweatpants",
    modelSlug: "sweatpants",
    viewer: "3d",
    priority: 7,
  },
  {
    id: "cargo-sweatpants",
    slug: "cargo-sweatpants",
    name: "Utility Cargo Sweatpants",
    tagline: "Tactical cargo pockets meet plush fleece comfort.",
    description: "Streetwear cargo joggers featuring twin snap-closure side utility pockets, adjustable drawcord cuffs, and heavy fleece warmth.",
    price: 2899,
    compareAt: 3399,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "80% Cotton, 20% Polyester Fleece, 360 GSM",
    fit: "Relaxed cargo fit",
    features: [
      "Dual snap cargo thigh pockets",
      "Adjustable ankle cord locks",
      "Heavyweight brushed interior",
      "Reinforced stress points",
    ],
    category: "graphics",
    garmentCategory: "Pants",
    garmentType: "Sweatpants",
    modelSlug: "sweatpants",
    viewer: "3d",
    priority: 8,
  },

  // --- CAPS ---
  {
    id: "studio-cap",
    slug: "studio-cap",
    name: "Studio Twill Cap",
    tagline: "6-panel dad hat with curved visor.",
    description: "Structured 6-panel cotton twill cap featuring an adjustable metal buckle strap, embroidered eyelets, and pre-curved visor.",
    price: 999,
    compareAt: 1299,
    colors: [...PRESET_COLORS],
    sizes: ["One Size"],
    fabric: "100% Cotton Twill",
    fit: "Adjustable 6-panel fit",
    features: [
      "Structured 6-panel crown",
      "Adjustable brass buckle enclosure",
      "Pre-curved sun visor",
      "Embroidered ventilation eyelets",
    ],
    category: "essentials",
    garmentCategory: "Caps",
    garmentType: "Cap",
    modelSlug: "cap",
    viewer: "3d",
    priority: 9,
  },
  {
    id: "premium-dad-hat",
    slug: "premium-dad-hat",
    name: "Vintage Softwash Dad Hat",
    tagline: "Unstructured enzyme-washed low profile cap.",
    description: "Enzyme washed for a broken-in vintage feel, this unstructured 6-panel cap offers low-profile comfort and a custom brass slider.",
    price: 1199,
    compareAt: 1499,
    colors: [...PRESET_COLORS],
    sizes: ["One Size"],
    fabric: "100% Washed Cotton Canvas",
    fit: "Unstructured low-profile fit",
    features: [
      "Vintage enzyme softwash",
      "Unstructured crown silhouette",
      "Antique brass strap slider",
      "Custom interior seam taping",
    ],
    category: "premium",
    garmentCategory: "Caps",
    garmentType: "Cap",
    modelSlug: "cap",
    viewer: "3d",
    priority: 10,
  },
  {
    id: "streetwear-snapback",
    slug: "streetwear-snapback",
    name: "Streetwear Flat-Brim Snapback",
    tagline: "High-crown structured snapback cap.",
    description: "Classic high-crown snapback with a stiffened buckram front panel, flat visor, and durable 7-position plastic snap closure.",
    price: 1299,
    compareAt: 1599,
    colors: [...PRESET_COLORS],
    sizes: ["One Size"],
    fabric: "80% Acrylic, 20% Wool Blend",
    fit: "High-crown snapback fit",
    features: [
      "Stiffened front buckram panels",
      "Flat visor with green undervisor",
      "Classic 7-hole snap closure",
      "High-density wool blend",
    ],
    category: "graphics",
    garmentCategory: "Caps",
    garmentType: "Cap",
    modelSlug: "cap",
    viewer: "3d",
    priority: 11,
  },

  // --- HOODIES & SWEATSHIRTS ---
  {
    id: "warmup-hoodie",
    slug: "warmup-hoodie",
    name: "Warmup Heavy Pullover Hoodie",
    tagline: "Heavy fleece pullover with double-layer hood.",
    description: "Premium heavy fleece hoodie designed with a structured double-layer hood, deep kangaroo pocket, and thick ribbed trim.",
    price: 3199,
    compareAt: 3699,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "80% Cotton, 20% Polyester, 380 GSM",
    fit: "Oversized hoodie fit",
    features: [
      "Heavyweight 380 GSM fleece",
      "Double-layer structured hood",
      "Spacious kangaroo pouch pocket",
      "Double-needle seam reinforcement",
    ],
    category: "essentials",
    garmentCategory: "Hoodies/Sweatshirts",
    garmentType: "Oversized Hoodie",
    modelSlug: "hoodie",
    viewer: "3d",
    priority: 12,
  },
  {
    id: "hanging-lounge-hoodie",
    slug: "hanging-lounge-hoodie",
    name: "Hanging Lounge Hoodie",
    tagline: "Relaxed drape lounge hoodie.",
    description: "A hanging drape hoodie featuring un-constricted side seams and a relaxed hood construct for a fluid, oversized lounge look.",
    price: 3499,
    compareAt: 3999,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% French Terry Cotton, 400 GSM",
    fit: "Relaxed hanging fit",
    features: [
      "Draped hanging silhouette",
      "Thick ribbed cuffs",
      "Minimalist drawstring-free hood",
      "Hidden side-entry pockets",
    ],
    category: "premium",
    garmentCategory: "Hoodies/Sweatshirts",
    garmentType: "Hanging Hoodie",
    modelSlug: "hanging-hoodie",
    viewer: "3d",
    priority: 13,
  },
  {
    id: "tech-zip-hoodie",
    slug: "tech-zip-hoodie",
    name: "Tech Bonded Zip Hoodie",
    tagline: "Water-resistant tech zip hoodie.",
    description: "Water-resistant matte zip hoodie with bonded zip pockets and a high-neck hood profile engineered for active city wear.",
    price: 3699,
    compareAt: 4199,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "Tech-Bonded Cotton Blend, 420 GSM",
    fit: "Structured zip hoodie fit",
    features: [
      "Water-resistant full zip closure",
      "Bonded zipper pockets",
      "High-neck hood profile",
      "Reinforced elbow panels",
    ],
    category: "graphics",
    garmentCategory: "Hoodies/Sweatshirts",
    garmentType: "Zip Hoodie",
    modelSlug: "zip-hoodie",
    viewer: "3d",
    priority: 14,
  },
  {
    id: "puff-print-sweatshirt",
    slug: "puff-print-sweatshirt",
    name: "Puff Print Fleece Sweatshirt",
    tagline: "Ultra-soft plush fleece crewneck with raised texture detail.",
    description: "Heavyweight crewneck sweatshirt featuring a plush fleece inner lining, ribbed side gussets, and classic V-stitch collar accent.",
    price: 2799,
    compareAt: 3299,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "80% Organic Cotton, 20% Fleece, 350 GSM",
    fit: "Oversized crewneck fit",
    features: [
      "Brushed inner fleece lining",
      "V-stitch collar detail",
      "Heavyweight 350 GSM warmth",
      "Ribbed cuffs and waistband",
    ],
    category: "graphics",
    garmentCategory: "Hoodies/Sweatshirts",
    garmentType: "Oversized Sweatshirt",
    modelSlug: "sweatshirt",
    viewer: "3d",
    priority: 15,
  },
  {
    id: "fleece-crewneck",
    slug: "fleece-crewneck",
    name: "Essential Fleece Crewneck",
    tagline: "Minimalist plush fleece sweatshirt for daily wear.",
    description: "Clean crewneck sweater with drop-shoulder silhouette, thick ribbed collar band, and ultra-soft brushed interior.",
    price: 2599,
    compareAt: 2999,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "80% Cotton, 20% Polyester Fleece, 340 GSM",
    fit: "Relaxed crewneck fit",
    features: [
      "Drop shoulder design",
      "Thick collar & cuff ribbing",
      "Soft wash finish",
      "Pre-shrunk fleece",
    ],
    category: "essentials",
    garmentCategory: "Hoodies/Sweatshirts",
    garmentType: "Oversized Sweatshirt",
    modelSlug: "sweatshirt",
    viewer: "3d",
    priority: 16,
  },
  {
    id: "heritage-polo",
    slug: "heritage-polo",
    name: "Heritage Pique Polo Shirt",
    tagline: "Elevated collar drape with horn placket.",
    description: "Heavyweight pique cotton polo shirt featuring a two-button horn placket, ribbed collar, and boxy oversized silhouette.",
    price: 2299,
    compareAt: 2699,
    colors: [...PRESET_COLORS],
    sizes: [...SIZES],
    fabric: "100% Heavy Pique Cotton, 240 GSM",
    fit: "Oversized polo fit",
    features: [
      "2-button placket with horn buttons",
      "Ribbed collar and sleeve bands",
      "Side hem slits",
      "Clean boxy drape",
    ],
    category: "premium",
    garmentCategory: "Hoodies/Sweatshirts",
    garmentType: "Oversized Polo Shirt",
    modelSlug: "polo-shirt",
    viewer: "3d",
    priority: 17,
  },
];

export function getProduct(slug: string): Product | undefined {
  const found = products.find((p) => p.slug === slug || p.id === slug);
  if (found) return found;

  // Fallback slug mapping for legacy links
  if (slug === "studio-tee" || slug === "everyday-crew") return products[1]; // Regular T-Shirt
  if (slug === "heavyweight-box") return products[0]; // Oversized T-Shirt
  if (slug === "restday-sweatpants" || slug === "heavyweight-joggers" || slug === "cargo-sweatpants") return products[9]; // Sweatpants
  if (slug === "studio-cap" || slug === "premium-dad-hat" || slug === "streetwear-snapback") return products[10]; // Cap
  if (slug.includes("hoodie")) return products[5]; // Oversized Hoodie
  if (slug.includes("sweatshirt")) return products[4]; // Sweatshirt
  if (slug.includes("polo")) return products[7]; // Polo Shirt

  return products[0];
}

export function formatINR(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export const SHIPPING_FLAT = 79;
export const FREE_SHIPPING_THRESHOLD = 1999;
