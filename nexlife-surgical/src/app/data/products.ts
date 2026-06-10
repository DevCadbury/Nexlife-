export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  priceUnit: string;
  shortDescription: string;
  description: string;
  images: string[];
  badge?: string;
  inStock: boolean;
  specs: { label: string; value: string }[];
  certifications: string[];
}

export const products: Product[] = [
  {
    id: "1",
    slug: "sterile-surgical-gloves-latex",
    name: "Sterile Surgical Gloves – Latex",
    category: "Disposable Gloves",
    price: "$48.00",
    priceUnit: "per box of 50 pairs",
    shortDescription: "Powder-free sterile latex surgical gloves with anatomic fit and high tactile sensitivity.",
    description: "NexLife Sterile Surgical Gloves are manufactured to the highest medical standards, providing exceptional barrier protection and tactile sensitivity for surgical procedures. Each glove undergoes 100% electrical testing and water-leak testing. Individually folded and double-packaged for easy, aseptic donning.",
    images: [
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1599412227383-b7d4751c8765?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1584819762556-68601d7f3a86?w=800&q=80&fm=webp",
    ],
    badge: "Best Seller",
    inStock: true,
    specs: [
      { label: "Material", value: "Natural Rubber Latex" },
      { label: "Sterility", value: "Sterile (EO Sterilized)" },
      { label: "Powdering", value: "Powder-Free" },
      { label: "Sizes Available", value: "5.5 / 6 / 6.5 / 7 / 7.5 / 8 / 8.5" },
      { label: "Thickness (Palm)", value: "0.18 mm" },
      { label: "AQL", value: "1.5" },
      { label: "Packaging", value: "50 pairs per box, individually wrapped" },
      { label: "Shelf Life", value: "5 years from manufacture date" },
    ],
    certifications: ["FDA 510(k)", "ISO 13485", "CE Marked", "EN 455"],
  },
  {
    id: "2",
    slug: "nitrile-examination-gloves",
    name: "Nitrile Examination Gloves",
    category: "Disposable Gloves",
    price: "$22.00",
    priceUnit: "per box of 100",
    shortDescription: "Powder-free, textured nitrile gloves offering superior chemical resistance and durability.",
    description: "Our Nitrile Examination Gloves are the preferred choice for healthcare professionals requiring strong chemical resistance without the risk of latex allergies. Micro-textured fingertips provide excellent grip in wet and dry conditions. Suitable for clinical examinations, laboratory use, and patient care.",
    images: [
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1599412227383-b7d4751c8765?w=800&q=80&fm=webp",
    ],
    badge: "ISO Certified",
    inStock: true,
    specs: [
      { label: "Material", value: "Nitrile (Acrylonitrile Butadiene)" },
      { label: "Sterility", value: "Non-Sterile" },
      { label: "Powdering", value: "Powder-Free" },
      { label: "Sizes Available", value: "XS / S / M / L / XL / XXL" },
      { label: "Thickness (Palm)", value: "0.08 mm" },
      { label: "AQL", value: "1.5" },
      { label: "Packaging", value: "100 gloves per box (ambidextrous)" },
      { label: "Shelf Life", value: "3 years from manufacture date" },
    ],
    certifications: ["FDA 510(k)", "ISO 13485", "CE Marked", "EN 374"],
  },
  {
    id: "3",
    slug: "surgical-face-mask-3ply",
    name: "Surgical Face Mask – 3-Ply",
    category: "Face Masks & Respirators",
    price: "$12.50",
    priceUnit: "per box of 50",
    shortDescription: "ASTM Level 2 fluid-resistant surgical masks with ear-loop or tie-on options.",
    description: "NexLife 3-Ply Surgical Masks provide reliable bacterial filtration (BFE ≥98%) and fluid resistance for surgical environments. The three-layer construction — melt-blown polypropylene filter flanked by non-woven layers — delivers comfort during extended wear without compromising protection.",
    images: [
      "https://images.unsplash.com/photo-1628235176517-71013205a2de?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80&fm=webp",
    ],
    inStock: true,
    specs: [
      { label: "Material", value: "PP Non-Woven + Melt-Blown Filter" },
      { label: "Layers", value: "3-Layer" },
      { label: "BFE", value: "≥98% @ 3.0 μm" },
      { label: "PFE", value: "≥95% @ 0.1 μm" },
      { label: "Fluid Resistance", value: "≥120 mmHg" },
      { label: "ASTM Level", value: "Level 2" },
      { label: "Packaging", value: "50 masks per box" },
      { label: "Shelf Life", value: "3 years" },
    ],
    certifications: ["FDA 510(k)", "ISO 13485", "ASTM F2100", "EN 14683"],
  },
  {
    id: "4",
    slug: "n95-respirator-mask",
    name: "N95 Respirator Mask – NIOSH Approved",
    category: "Face Masks & Respirators",
    price: "$38.00",
    priceUnit: "per box of 20",
    shortDescription: "NIOSH-approved N95 respirators with adjustable nose wire and foam nose cushion.",
    description: "Engineered for maximum respiratory protection, NexLife N95 Respirators filter ≥95% of non-oil-based airborne particles, including virus-carrying aerosols. The cup-shape design provides ample breathing room while the integrated exhalation valve reduces heat and moisture build-up during prolonged use.",
    images: [
      "https://images.unsplash.com/photo-1628235176517-71013205a2de?w=800&q=80&fm=webp",
    ],
    badge: "NIOSH Approved",
    inStock: true,
    specs: [
      { label: "Material", value: "Multi-layer Melt-Blown Filtration" },
      { label: "Filtration Efficiency", value: "≥95% (non-oil-based particles)" },
      { label: "Style", value: "Cup-Shape with Exhalation Valve" },
      { label: "Nose Wire", value: "Adjustable Aluminum Strip" },
      { label: "Headbands", value: "Dual Elastic Headbands" },
      { label: "Standard", value: "NIOSH 42 CFR Part 84" },
      { label: "Packaging", value: "20 units per box" },
      { label: "Shelf Life", value: "5 years" },
    ],
    certifications: ["NIOSH Approved", "FDA EUA", "ISO 13485", "CE FFP2"],
  },
  {
    id: "5",
    slug: "disposable-syringes-5ml",
    name: "Disposable Syringes – 5ml",
    category: "Syringes & Needles",
    price: "$18.00",
    priceUnit: "per box of 100",
    shortDescription: "Luer-lock sterile disposable syringes with smooth plunger action and clear barrel.",
    description: "NexLife Disposable Syringes feature crystal-clear barrels for precise volume reading, smooth silicone-lubricated plunger action, and a secure luer-lock tip. Individually blister-packed to maintain sterility. Available in volumes from 1ml to 60ml to suit all clinical applications.",
    images: [
      "https://images.unsplash.com/photo-1766297247072-93fd815afef3?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1768498993096-6db9950eeb1b?w=800&q=80&fm=webp",
    ],
    inStock: true,
    specs: [
      { label: "Volume", value: "5 ml" },
      { label: "Tip Type", value: "Luer-Lock" },
      { label: "Barrel Material", value: "Medical-Grade Polypropylene" },
      { label: "Plunger", value: "Silicone-Free Rubber (latex-free)" },
      { label: "Sterility", value: "Sterile (EO Sterilized)" },
      { label: "Graduation", value: "0.2 ml increments" },
      { label: "Packaging", value: "100 units per box, individual blister pack" },
      { label: "Shelf Life", value: "5 years" },
    ],
    certifications: ["FDA 510(k)", "ISO 7886-1", "ISO 13485", "CE Marked"],
  },
  {
    id: "6",
    slug: "stainless-steel-surgical-scissors",
    name: "Stainless Steel Surgical Scissors",
    category: "Surgical Instruments",
    price: "$95.00",
    priceUnit: "per unit",
    shortDescription: "Autoclavable German-grade stainless steel Mayo scissors for general surgery.",
    description: "Precision-crafted from 17-4 German stainless steel, NexLife Mayo Scissors deliver sharp, precise cuts across a wide range of tissues. Autoclavable up to 134°C. The ring-handle design reduces operator fatigue during extended procedures. Available in straight and curved blade configurations.",
    images: [
      "https://images.unsplash.com/photo-1685997179880-6449203a053e?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1514416309827-bfb0cf433a2d?w=800&q=80&fm=webp",
    ],
    badge: "Premium",
    inStock: true,
    specs: [
      { label: "Material", value: "17-4 German Stainless Steel" },
      { label: "Type", value: "Mayo Scissors (Straight/Curved)" },
      { label: "Length", value: "17 cm / 19 cm" },
      { label: "Sterilization", value: "Autoclavable up to 134°C" },
      { label: "Handle", value: "Ring Handle with Box-Lock Joint" },
      { label: "Blade Finish", value: "Satin / Mirror Finish" },
      { label: "Packaging", value: "Individual sterile pouch" },
      { label: "Warranty", value: "3 years against manufacturing defects" },
    ],
    certifications: ["ISO 13485", "CE Marked", "FDA 510(k)"],
  },
  {
    id: "7",
    slug: "sterile-wound-dressing",
    name: "Sterile Wound Dressing – Non-Adherent",
    category: "Wound Care",
    price: "$32.00",
    priceUnit: "per box of 100",
    shortDescription: "Non-adherent sterile wound dressings that minimize trauma at dressing change.",
    description: "NexLife Non-Adherent Wound Dressings are designed for use on superficial wounds, burns, and skin grafts. The low-adherent facing allows for easy removal with minimal pain and no disruption to the healing tissue. Absorbent core wicks exudate away from the wound bed.",
    images: [
      "https://images.unsplash.com/photo-1768498993096-6db9950eeb1b?w=800&q=80&fm=webp",
    ],
    inStock: true,
    specs: [
      { label: "Facing", value: "Non-Adherent Perforated Film" },
      { label: "Core", value: "Absorbent Cellulose Pad" },
      { label: "Sizes", value: "5×5 cm / 10×10 cm / 10×20 cm" },
      { label: "Sterility", value: "Sterile (Gamma Irradiated)" },
      { label: "Packaging", value: "100 units per box, individually wrapped" },
      { label: "Shelf Life", value: "5 years" },
    ],
    certifications: ["FDA 510(k)", "ISO 13485", "CE Marked"],
  },
  {
    id: "8",
    slug: "disposable-isolation-gowns",
    name: "Disposable Isolation Gowns – Level 2",
    category: "Protective Apparel",
    price: "$55.00",
    priceUnit: "per box of 10",
    shortDescription: "AAMI Level 2 fluid-resistant isolation gowns with knit cuffs and tie-back closure.",
    description: "Manufactured from SMS non-woven fabric, NexLife Isolation Gowns provide dependable barrier protection against low-to-moderate fluid hazards. The reinforced critical zones (chest and forearms) meet AAMI Level 2 standards. Knit cuffs and adjustable tie-back closure ensure a secure, comfortable fit.",
    images: [
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80&fm=webp",
      "https://images.unsplash.com/photo-1768498993096-6db9950eeb1b?w=800&q=80&fm=webp",
    ],
    inStock: false,
    specs: [
      { label: "Material", value: "SMS Non-Woven (45 gsm)" },
      { label: "AAMI Level", value: "Level 2" },
      { label: "Closure", value: "Tie-Back at Neck and Waist" },
      { label: "Cuffs", value: "Knit Wrist Cuffs" },
      { label: "Sizes", value: "S / M / L / XL / 2XL / 3XL" },
      { label: "Color", value: "Blue / White" },
      { label: "Packaging", value: "10 gowns per box" },
      { label: "Shelf Life", value: "3 years" },
    ],
    certifications: ["FDA 510(k)", "ISO 13485", "AAMI PB70", "CE Marked"],
  },
];

export const categories = [
  {
    id: "surgical-instruments",
    name: "Surgical Instruments",
    description: "Precision-crafted instruments for every OR need",
    image: "https://images.unsplash.com/photo-1685997179880-6449203a053e?w=600&q=80&fm=webp",
    count: 48,
  },
  {
    id: "disposable-gloves",
    name: "Disposable Gloves",
    description: "Sterile & non-sterile options in latex and nitrile",
    image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80&fm=webp",
    count: 32,
  },
  {
    id: "face-masks-respirators",
    name: "Face Masks & Respirators",
    description: "ASTM & NIOSH certified respiratory protection",
    image: "https://images.unsplash.com/photo-1628235176517-71013205a2de?w=600&q=80&fm=webp",
    count: 24,
  },
  {
    id: "syringes-needles",
    name: "Syringes & Needles",
    description: "Sterile, single-use injection systems",
    image: "https://images.unsplash.com/photo-1766297247072-93fd815afef3?w=600&q=80&fm=webp",
    count: 19,
  },
  {
    id: "wound-care",
    name: "Wound Care",
    description: "Dressings, bandages, and wound management products",
    image: "https://images.unsplash.com/photo-1768498993096-6db9950eeb1b?w=600&q=80&fm=webp",
    count: 27,
  },
  {
    id: "protective-apparel",
    name: "Protective Apparel",
    description: "Gowns, drapes, and full-body protective suits",
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&q=80&fm=webp",
    count: 16,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const featuredProducts = products.slice(0, 4);
