// CDN base for Putul Fashions product images
const CDN = "https://d1311wbk6unapo.cloudfront.net/NushopCatalogue";
const CDN2 = "https://d1311wbk6unapo.cloudfront.net/NushopWebsiteAsset2";
const STORE_ID = "69870e125223b1da7d5437a8";

// Helper to build image URL with custom width
const img = (path: string, w = 600) =>
  `${CDN}/tr:f-webp,w-${w},fo-auto/${STORE_ID}/${path}`;

const catImg = (path: string, w = 500) =>
  `${CDN}/tr:f-webp,w-${w},fo-auto/${STORE_ID}/${path}`;

const bannerImg = (path: string) =>
  `${CDN2}/tr:f-webp,w-1920,fo-auto/${path}`;

export interface ProductVariant {
  id: string;
  color: string;
  colorCode?: string;
  size: string;
  stock: number;
  priceAdjustment: number;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage: string;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: string[];
  description: string;
  fabric: string;
  trending?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  badge?: string;
  variants?: ProductVariant[];
}

export interface Category {
  name: string;
  image: string;
  slug: string;
  productCount: number;
}

// Hero/Banner images from the actual website
export const heroBanners = [
  {
    image: bannerImg("creatives-media/widget_banner/creative-Mon-Feb-16-2026-re17SUmPnxMi.jpg"),
    title: "Tuscan Trailblazers",
    subtitle: "Adventure Meets Artisanal Elegance",
    cta: "Explore the Collection",
  },
  {
    image: bannerImg("creatives-media/widget_banner/creative-Mon-Feb-16-2026-YQHvHP-W_DZT.jpg"),
    title: "Step Into Style",
    subtitle: "Premium Footwear for the Modern Man",
    cta: "Shop Now",
  },
  {
    image: `${CDN}/tr:f-webp,w-1920,fo-auto/${STORE_ID}/template/1771325896634_KKA1ZUB60Y_2026-02-17_1.jpg`,
    title: "Walk With Confidence",
    subtitle: "Comfort Meets Contemporary Design",
    cta: "Discover More",
  },
];

export const categories: Category[] = [
  {
    name: "Crocs",
    image: catImg("template/1771325829601_RNWT1RFKTH_2026-02-17_1.jpg"),
    slug: "crocs",
    productCount: 5,
  },
  {
    name: "Sports Shoes",
    image: catImg("template/1771325829601_VQTFFN6NXJ_2026-02-17_2.jpg"),
    slug: "sports-shoes",
    productCount: 1,
  },
  {
    name: "Slides & Slippers",
    image: catImg("template/1771325829601_HB9NJUTOXU_2026-02-17_3.jpg"),
    slug: "slides-slippers",
    productCount: 6,
  },
  {
    name: "Loafer Sandals",
    image: catImg("template/1771325829601_OXFL75JNPB_2026-02-17_4.jpg"),
    slug: "loafer-sandals",
    productCount: 7,
  },
  {
    name: "Accessories",
    image: img("cat_img/B0GN92PMC6_JYBYF7JEQA_2026-03-24_1.jpg"),
    slug: "accessories",
    productCount: 1,
  },
];

export const products: Product[] = [
  // ===== SPORTS SHOES =====
  {
    id: "1",
    name: "White Premium Rubber Sports Shoes For Men",
    price: 699,
    originalPrice: 1499,
    image: img("cat_img/PMWHS_1771246795312_5mafglnsq4qw6fu.jpg"),
    hoverImage: img("cat_img/PMWHS_1771246796294_4jklpywzcedj6yc.jpg"),
    images: [
      img("cat_img/PMWHS_1771246795312_5mafglnsq4qw6fu.jpg", 800),
      img("cat_img/PMWHS_1771246796294_4jklpywzcedj6yc.jpg", 800),
      img("cat_img/PMWHS_1771246801031_evyrsft2z0jx7oh.jpg", 800),
    ],
    category: "sports-shoes",
    rating: 4.6,
    reviews: 142,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["White"],
    description: "Premium white rubber sports shoes engineered for performance and everyday comfort. Lightweight design with responsive cushioning, breathable upper, and excellent grip for various surfaces.",
    fabric: "Premium Rubber Upper, EVA Midsole",
    bestSeller: true,
    newArrival: true,
    badge: "53% OFF",
  },

  // ===== CROCS =====
  {
    id: "2",
    name: "Grey Premium Eva Clogs For Men",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg"),
    hoverImage: img("cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg"),
    images: [
      img("cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg", 800),
    ],
    category: "crocs",
    rating: 4.5,
    reviews: 156,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Grey", "Mehandi", "Beige", "Sky Blue", "Black"],
    description: "Lightweight and breathable grey EVA clogs with a modern design. Features ventilation holes for airflow and a textured footbed for comfort.",
    fabric: "Premium EVA Material",
    bestSeller: true,
    badge: "71% OFF",
  },
  {
    id: "3",
    name: "Grey Mens Casual Slip-On Eva Clogs",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/Grey_Mens_Casual_Slip_On_Eva_Cloges_Q10CAV6IH3_2026-02-28_1.jpeg"),
    hoverImage: img("cat_img/Grey_Mens_Casual_Slip_On_Eva_Cloges_Q10CAV6IH3_2026-02-28_1.jpeg"),
    images: [
      img("cat_img/Grey_Mens_Casual_Slip_On_Eva_Cloges_Q10CAV6IH3_2026-02-28_1.jpeg", 800),
    ],
    category: "crocs",
    rating: 4.3,
    reviews: 94,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Grey", "White", "Black"],
    description: "Casual slip-on EVA clogs with a minimalist design. Easy to wear and incredibly comfortable for everyday use.",
    fabric: "Soft Quality EVA",
    newArrival: true,
    badge: "71% OFF",
  },
  {
    id: "4",
    name: "Sky Premium Eva Clogs For Men",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/Sky_Premium_Eva_Clogs_For_Men_873189XXRO_2026-02-25_1.webp"),
    hoverImage: img("cat_img/Sky_Premium_Eva_Clogs_For_Men_873189XXRO_2026-02-25_1.webp"),
    images: [
      img("cat_img/Sky_Premium_Eva_Clogs_For_Men_873189XXRO_2026-02-25_1.webp", 800),
    ],
    category: "crocs",
    rating: 4.4,
    reviews: 88,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Sky Blue", "Black", "White"],
    description: "Fresh sky blue EVA clogs that combine comfort with style. Anti-slip sole and ergonomic design for all-day wear.",
    fabric: "Premium EVA Material",
    trending: true,
    badge: "71% OFF",
  },
  {
    id: "5",
    name: "Blue Premium Eva Clogs For Men",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/Blue_Premium_Eva_Clogs_For_Men_M46JSNUJOA_2026-02-25_1.webp"),
    hoverImage: img("cat_img/Blue_Premium_Eva_Clogs_For_Men_M46JSNUJOA_2026-02-25_1.webp"),
    images: [
      img("cat_img/Blue_Premium_Eva_Clogs_For_Men_M46JSNUJOA_2026-02-25_1.webp", 800),
    ],
    category: "crocs",
    rating: 4.3,
    reviews: 76,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Blue", "Grey", "Mehandi"],
    description: "Vibrant blue EVA clogs with modern design. Lightweight with ventilation ports for breathability and all-day comfort.",
    fabric: "Premium EVA Material",
    newArrival: true,
    badge: "71% OFF",
  },
  {
    id: "6",
    name: "Black Premium Eva Clogs For Men",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/PBLKC_1771246833906_jauworam6rhhsuy.jpg"),
    hoverImage: img("cat_img/PBLKC_1771246833906_jauworam6rhhsuy.jpg"),
    images: [
      img("cat_img/PBLKC_1771246833906_jauworam6rhhsuy.jpg", 800),
    ],
    category: "crocs",
    rating: 4.6,
    reviews: 134,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Black", "Grey"],
    description: "Classic black EVA clogs with premium build quality. Features anti-slip sole, ventilation holes, and ergonomic footbed.",
    fabric: "Premium EVA Material",
    trending: true,
    badge: "71% OFF",
  },

  // ===== SLIDES & SLIPPERS =====
  {
    id: "7",
    name: "Mouse Premium Eva Slides For Men",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/Mouse_Premium_Eva_Slides_For_Men_XSYCYK151O_2026-02-26_1.jpg"),
    hoverImage: img("cat_img/Mouse_Premium_Eva_Slides_For_Men_PN8NU4KCHQ_2026-02-26_2.jpeg"),
    images: [
      img("cat_img/Mouse_Premium_Eva_Slides_For_Men_XSYCYK151O_2026-02-26_1.jpg", 800),
      img("cat_img/Mouse_Premium_Eva_Slides_For_Men_PN8NU4KCHQ_2026-02-26_2.jpeg", 800),
    ],
    category: "slides-slippers",
    rating: 4.3,
    reviews: 67,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Mouse Grey", "White", "Black"],
    description: "Trendy mouse-colored EVA slides with a minimalist design. Ultra-lightweight and perfect for casual daily wear.",
    fabric: "Premium EVA Material",
    newArrival: true,
    badge: "71% OFF",
  },
  {
    id: "8",
    name: "Beige Premium Eva Slides For Men",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/Beige_Premium_Eva_Slides_For_Men_WZY078AUOI_2026-02-26_1.jpeg"),
    hoverImage: img("cat_img/Beige_Premium_Eva_Slides_For_Men_WZY078AUOI_2026-02-26_1.jpeg"),
    images: [
      img("cat_img/Beige_Premium_Eva_Slides_For_Men_WZY078AUOI_2026-02-26_1.jpeg", 800),
    ],
    category: "slides-slippers",
    rating: 4.4,
    reviews: 82,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Beige", "White", "Black"],
    description: "Elegant beige EVA slides with premium textured footbed. Soft, cushioned sole for maximum comfort and relaxation.",
    fabric: "Premium EVA Material",
    trending: true,
    badge: "71% OFF",
  },
  {
    id: "9",
    name: "Black Premium Eva Slides For Men",
    price: 399,
    originalPrice: 1198,
    image: img("cat_img/Black_Premium_Eva_Slides_For_Men_ENSVDCU3SP_2026-03-12_1.jpeg"),
    hoverImage: img("cat_img/Black_Premium_Eva_Slides_For_Men_JCHRQZ4K0X_2026-03-12_2.jpeg"),
    images: [
      img("cat_img/Black_Premium_Eva_Slides_For_Men_ENSVDCU3SP_2026-03-12_1.jpeg", 800),
      img("cat_img/Black_Premium_Eva_Slides_For_Men_JCHRQZ4K0X_2026-03-12_2.jpeg", 800),
      img("cat_img/Black_Premium_Eva_Slides_For_Men_PRSFDP0YF8_2026-03-12_3.jpeg", 800),
    ],
    category: "slides-slippers",
    rating: 4.4,
    reviews: 178,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Black", "White", "Grey"],
    description: "Sleek black EVA slides with premium construction. Ultra-lightweight with a cushioned footbed for maximum comfort.",
    fabric: "Premium EVA Material",
    bestSeller: true,
    badge: "66% OFF",
  },
  {
    id: "10",
    name: "White Premium Eva Slides For Men",
    price: 399,
    originalPrice: 1198,
    image: img("cat_img/White_Premium_Eva_Slides_For_Men_KKINZZDYEV_2026-02-26_1.webp"),
    hoverImage: img("cat_img/Black_Premium_Eva_Slides_For_Men__02HAAO5PX4_2026-02-26_1.webp"),
    images: [
      img("cat_img/White_Premium_Eva_Slides_For_Men_KKINZZDYEV_2026-02-26_1.webp", 800),
      img("cat_img/Black_Premium_Eva_Slides_For_Men__02HAAO5PX4_2026-02-26_1.webp", 800),
      img("cat_img/SKY_Premium_Eva_Slides_For_Men_HSN6G8P27I_2026-02-26_1.webp", 800),
    ],
    category: "slides-slippers",
    rating: 4.4,
    reviews: 98,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["White", "Black", "Sky Blue"],
    description: "Ultra-soft premium white EVA slides designed for maximum comfort. Perfect for casual outings, poolside lounging, and everyday relaxation.",
    fabric: "Premium EVA Material",
    trending: true,
    badge: "66% OFF",
  },
  {
    id: "11",
    name: "Grey Premium Eva Slides For Men",
    price: 399,
    originalPrice: 1198,
    image: img("cat_img/PGREY_S_1771246790819_grmpio7u5e8euac.jpg"),
    hoverImage: img("cat_img/PGREY_S_1771246837549_xebaounw5ob3g57.jpg"),
    images: [
      img("cat_img/PGREY_S_1771246790819_grmpio7u5e8euac.jpg", 800),
      img("cat_img/PGREY_S_1771246837549_xebaounw5ob3g57.jpg", 800),
    ],
    category: "slides-slippers",
    rating: 4.5,
    reviews: 112,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Grey", "Sky Blue", "Black"],
    description: "Classic grey EVA slides with a premium textured footbed. Designed for relaxation and style with a cushioned sole.",
    fabric: "Premium EVA Material",
    bestSeller: true,
    badge: "66% OFF",
  },
  {
    id: "12",
    name: "Sky Premium Eva Slides For Men",
    price: 399,
    originalPrice: 1198,
    image: img("cat_img/Sky_Premium_Eva_Slides_For_Men_3KV7DSGB6B_2026-02-25_1.webp"),
    hoverImage: img("cat_img/Sky_Premium_Eva_Slides_For_Men_3KV7DSGB6B_2026-02-25_1.webp"),
    images: [
      img("cat_img/Sky_Premium_Eva_Slides_For_Men_3KV7DSGB6B_2026-02-25_1.webp", 800),
    ],
    category: "slides-slippers",
    rating: 4.3,
    reviews: 74,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Sky Blue", "Grey", "Black"],
    description: "Cool sky blue EVA slides with premium textured footbed. Lightweight and comfortable for daily wear.",
    fabric: "Premium EVA Material",
    newArrival: true,
    badge: "66% OFF",
  },

  // ===== LOAFER SANDALS =====
  {
    id: "13",
    name: "Brown Mens Premium QualityAirmix Sandals",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg"),
    hoverImage: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg"),
    images: [
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg", 800),
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg", 800),
    ],
    category: "loafer-sandals",
    rating: 4.7,
    reviews: 89,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Brown", "Black"],
    description: "Premium quality Airmix sandals with superior cushioning and a sophisticated brown finish. Designed for all-day comfort with style.",
    fabric: "Premium Airmix Material",
    bestSeller: true,
    trending: true,
    badge: "53% OFF",
  },
  {
    id: "14",
    name: "Black Mens Premium QualityAirmix Sandals",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/Black_Mens_Premium_QualityAirmix_Sandls_UCLTLI0QOT_2026-03-05_1.jpeg"),
    hoverImage: img("cat_img/Black_Mens_Premium_QualityAirmix_Sandls_28IVJQ6FL1_2026-03-05_2.jpeg"),
    images: [
      img("cat_img/Black_Mens_Premium_QualityAirmix_Sandls_UCLTLI0QOT_2026-03-05_1.jpeg", 800),
      img("cat_img/Black_Mens_Premium_QualityAirmix_Sandls_28IVJQ6FL1_2026-03-05_2.jpeg", 800),
      img("cat_img/Black_Mens_Premium_QualityAirmix_Sandls_O2EJTDFGRA_2026-03-05_3.jpeg", 800),
      img("cat_img/Black_Mens_Premium_QualityAirmix_Sandls_V9LFNOI22D_2026-03-05_4.jpeg", 800),
    ],
    category: "loafer-sandals",
    rating: 4.7,
    reviews: 58,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Black", "Brown"],
    description: "Premium black Airmix sandal with advanced cushioning technology. Lightweight and durable for all-day comfort.",
    fabric: "Premium Airmix Material",
    bestSeller: true,
    badge: "53% OFF",
  },
  {
    id: "15",
    name: "Brown Premium Sandal For Men",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/Brown_Premium_Sandal_For_Men_FBYWKVAXTT_2026-03-05_1.webp"),
    hoverImage: img("cat_img/Brown_Premium_Sandal_For_Men_QL5BQ3DOHU_2026-03-05_2.webp"),
    images: [
      img("cat_img/Brown_Premium_Sandal_For_Men_FBYWKVAXTT_2026-03-05_1.webp", 800),
      img("cat_img/Brown_Premium_Sandal_For_Men_QL5BQ3DOHU_2026-03-05_2.webp", 800),
      img("cat_img/Brown_Premium_Sandal_For_Men_4B6DFHZAYP_2026-03-05_3.webp", 800),
    ],
    category: "loafer-sandals",
    rating: 4.5,
    reviews: 96,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Brown", "Tan", "Black"],
    description: "Premium brown sandal with superior comfort and craftsmanship. Features a cushioned insole and durable outsole for everyday wear.",
    fabric: "Premium PVC Material",
    trending: true,
    badge: "53% OFF",
  },
  {
    id: "16",
    name: "Tan Premium Airmix Sandal For Men",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/6rghnbxM_UGXA9986RR_2026-02-16_1.png"),
    hoverImage: img("cat_img/PTAN_S_1771246783872_8kbzg09cfnp56fa.jpg"),
    images: [
      img("cat_img/6rghnbxM_UGXA9986RR_2026-02-16_1.png", 800),
      img("cat_img/PTAN_S_1771246783872_8kbzg09cfnp56fa.jpg", 800),
    ],
    category: "loafer-sandals",
    rating: 4.5,
    reviews: 64,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Tan"],
    description: "Elegant tan Airmix sandal combining style with all-day comfort. Perfect for casual and semi-formal occasions.",
    fabric: "Premium Airmix Material",
    trending: true,
    badge: "53% OFF",
  },
  {
    id: "17",
    name: "Black Premium Sandal For Men",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/Black_Premium__Sandal_For_Men_UJYH0IXMSM_2026-03-05_1.webp"),
    hoverImage: img("cat_img/Black_Premium__Sandal_For_Men_UJYH0IXMSM_2026-03-05_1.webp"),
    images: [
      img("cat_img/Black_Premium__Sandal_For_Men_UJYH0IXMSM_2026-03-05_1.webp", 800),
    ],
    category: "loafer-sandals",
    rating: 4.5,
    reviews: 62,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Black", "Tan", "Brown"],
    description: "Sleek black premium sandal with superior comfort. Features cushioned insole and durable outsole for everyday wear.",
    fabric: "Premium PVC Material",
    bestSeller: true,
    badge: "53% OFF",
  },
  {
    id: "18",
    name: "Black And Tan Premium Airmix Sandal Combo Pack Of 2",
    price: 1199,
    originalPrice: 2399,
    image: img("cat_img/LFqjiLqz_8YWL3ZOWTB_2026-02-16_1.png"),
    hoverImage: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg"),
    images: [
      img("cat_img/LFqjiLqz_8YWL3ZOWTB_2026-02-16_1.png", 800),
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg", 800),
      img("cat_img/Black_Mens_Premium_QualityAirmix_Sandls_UCLTLI0QOT_2026-03-05_1.jpeg", 800),
    ],
    category: "loafer-sandals",
    rating: 4.8,
    reviews: 198,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Black", "Tan"],
    description: "Best value combo pack featuring both Black and Tan Premium Airmix Sandals. Get two premium sandals at an unbeatable price.",
    fabric: "Premium Airmix Material",
    bestSeller: true,
    badge: "COMBO",
  },
  {
    id: "19",
    name: "Brown Premium PVC Sandal For Men",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/Brown_Premium_Sandal_For_Men_FBYWKVAXTT_2026-03-05_1.webp"),
    hoverImage: img("cat_img/Brown_Premium_Sandal_For_Men_QL5BQ3DOHU_2026-03-05_2.webp"),
    images: [
      img("cat_img/Brown_Premium_Sandal_For_Men_FBYWKVAXTT_2026-03-05_1.webp", 800),
      img("cat_img/Brown_Premium_Sandal_For_Men_QL5BQ3DOHU_2026-03-05_2.webp", 800),
      img("cat_img/Brown_Premium_Sandal_For_Men_4B6DFHZAYP_2026-03-05_3.webp", 800),
    ],
    category: "loafer-sandals",
    rating: 4.4,
    reviews: 72,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Brown", "Black"],
    description: "Durable brown PVC sandal with a classic design. Water-resistant and easy to maintain, perfect for monsoon season.",
    fabric: "Premium PVC Material",
    badge: "53% OFF",
  },

  // ===== ACCESSORIES =====
  {
    id: "20",
    name: "Chest Bag",
    price: 299,
    originalPrice: 599,
    image: img("cat_img/B0GNMXGWJ7_6TSHIWMGEV_2026-03-24_1.jpg"),
    hoverImage: img("cat_img/B0GNMXGWJ7_E4NJQCAK8S_2026-03-24_2.jpg"),
    images: [
      img("cat_img/B0GNMXGWJ7_6TSHIWMGEV_2026-03-24_1.jpg", 800),
      img("cat_img/B0GNMXGWJ7_E4NJQCAK8S_2026-03-24_2.jpg", 800),
      img("cat_img/B0GNMXGWJ7_U60YY4JD6K_2026-03-24_3.jpg", 800),
      img("cat_img/B0GNMXGWJ7_JZFVH8LH2J_2026-03-24_4.jpg", 800),
    ],
    category: "accessories",
    rating: 4.2,
    reviews: 34,
    sizes: ["Free Size"],
    colors: ["Regal Green Plain", "Premium Brown Croc", "Regal Tan Croc", "Premium Green Plain", "Regal Choc Croc", "Regal Brown Croc", "Regal Green Croc", "Regal Brown Plain", "Premium Tan Plain", "Premium Green Croc"],
    description: "Stylish and functional chest bag perfect for everyday carry. Lightweight design with adjustable strap and multiple compartments.",
    fabric: "Premium Nylon",
    newArrival: true,
    badge: "50% OFF",
  },
];

// Customer testimonials from the actual website
import testimonial1 from "@/assets/testimonial-1.jpg";
import testimonial2 from "@/assets/testimonial-2.jpg";
import testimonial3 from "@/assets/testimonial-3.jpg";
import testimonial4 from "@/assets/testimonial-4.jpg";
import testimonial5 from "@/assets/testimonial-5.jpg";
import testimonial6 from "@/assets/testimonial-6.jpg";

export const testimonials = [
  { name: "Sandeep Reddy", date: "20/11/25", image: testimonial1, text: "I bought this recently and I must say it exceeded my expectations. The finishing is impressive and gives a very classy feel when worn." },
  { name: "Ankit Verma", date: "21/11/25", image: testimonial2, text: "This has become my go to choice for daily wear since the day it arrived. The comfort level is really amazing and it supports my feet properly." },
  { name: "Rohit Sharma", date: "24/10/25", image: testimonial3, text: "I recently purchased this from Putul and I am genuinely impressed with the comfort it provides throughout the day. The material feels very premium." },
  { name: "Prashant Mishra", date: "05/02/26", image: testimonial4, text: "This turned out to be a really good purchase for me. The comfort level is excellent throughout the day. The fitting is perfect and gives proper support." },
  { name: "Deepak Nair", date: "23/01/26", image: testimonial5, text: "I bought this a few weeks ago and the experience has been amazing so far. It feels soft and supportive from the first use itself." },
  { name: "Rakesh Yadav", date: "31/12/25", image: testimonial6, text: "I am very pleased with this purchase from Putul. The fitting is just right and feels comfortable all day. It is suitable for regular use." },
];
