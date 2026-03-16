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
    productCount: 8,
  },
  {
    name: "Sports Shoes",
    image: catImg("template/1771325829601_VQTFFN6NXJ_2026-02-17_2.jpg"),
    slug: "sports-shoes",
    productCount: 4,
  },
  {
    name: "Slides & Slippers",
    image: catImg("template/1771325829601_HB9NJUTOXU_2026-02-17_3.jpg"),
    slug: "slides-slippers",
    productCount: 10,
  },
  {
    name: "Loafer Sandals",
    image: catImg("template/1771325829601_OXFL75JNPB_2026-02-17_4.jpg"),
    slug: "loafer-sandals",
    productCount: 6,
  },
];

export const products: Product[] = [
  {
    id: "1",
    name: "White Premium Rubber Sports Shoes",
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
    description: "Premium white rubber sports shoes engineered for performance and everyday comfort. Lightweight design with responsive cushioning and breathable upper.",
    fabric: "Premium Rubber Upper, EVA Midsole",
    bestSeller: true,
    newArrival: true,
    badge: "53% OFF",
  },
  {
    id: "2",
    name: "White Premium Eva Slides",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/PWHTS_1771246780565_4zc4xc6irzibu9v.jpg"),
    hoverImage: img("cat_img/PWHTS_1771246811414_czplahyxr4hgf6p.jpg"),
    images: [
      img("cat_img/PWHTS_1771246780565_4zc4xc6irzibu9v.jpg", 800),
      img("cat_img/PWHTS_1771246811414_czplahyxr4hgf6p.jpg", 800),
      img("cat_img/PWHTS_1771246794843_6bizsijr74jmlxr.jpg", 800),
    ],
    category: "slides-slippers",
    rating: 4.4,
    reviews: 98,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["White"],
    description: "Ultra-soft premium EVA slides designed for maximum comfort. Perfect for casual outings, poolside lounging, and everyday relaxation.",
    fabric: "Premium EVA Material",
    trending: true,
    badge: "71% OFF",
  },
  {
    id: "3",
    name: "Grey Premium Eva Clogs",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg"),
    hoverImage: img("cat_img/PMGRYC_1771246777782_zvsql2d77l5lwbc.jpg"),
    images: [
      img("cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg", 800),
      img("cat_img/PMGRYC_1771246777782_zvsql2d77l5lwbc.jpg", 800),
      img("cat_img/PMGRYC_1771246787454_g0l8v53wev2y24r.jpg", 800),
    ],
    category: "crocs",
    rating: 4.5,
    reviews: 156,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Grey"],
    description: "Lightweight and breathable grey EVA clogs with a modern design. Features ventilation holes for airflow and a textured footbed for comfort.",
    fabric: "Premium EVA Material",
    bestSeller: true,
    badge: "71% OFF",
  },
  {
    id: "4",
    name: "Brown Premium Airmix Sandals",
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
    colors: ["Brown"],
    description: "Premium quality Airmix sandals with superior cushioning and a sophisticated brown finish. Designed for all-day comfort with style.",
    fabric: "Premium Airmix Material",
    bestSeller: true,
    trending: true,
    badge: "53% OFF",
  },
  {
    id: "5",
    name: "Mouse Premium Eva Slides",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/Mouse_Premium_Eva_Slides_For_Men_XSYCYK151O_2026-02-26_1.jpg"),
    hoverImage: img("cat_img/Mouse_Premium_Eva_Slides_For_Men_PN8NU4KCHQ_2026-02-26_2.jpeg"),
    images: [
      img("cat_img/Mouse_Premium_Eva_Slides_For_Men_XSYCYK151O_2026-02-26_1.jpg", 800),
      img("cat_img/Mouse_Premium_Eva_Slides_For_Men_PN8NU4KCHQ_2026-02-26_2.jpeg", 800),
      img("cat_img/Mouse_Premium_Eva_Slides_For_Men_ZBQQ9Z6DB3_2026-02-26_3.jpg", 800),
    ],
    category: "slides-slippers",
    rating: 4.3,
    reviews: 67,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Mouse Grey"],
    description: "Trendy mouse-colored EVA slides with a minimalist design. Ultra-lightweight and perfect for casual daily wear.",
    fabric: "Premium EVA Material",
    newArrival: true,
    badge: "71% OFF",
  },
  {
    id: "6",
    name: "Grey Premium Eva Slides",
    price: 399,
    originalPrice: 1198,
    image: img("cat_img/PGREY_S_1771246790819_grmpio7u5e8euac.jpg"),
    hoverImage: img("cat_img/PGREY_S_1771246837549_xebaounw5ob3g57.jpg"),
    images: [
      img("cat_img/PGREY_S_1771246790819_grmpio7u5e8euac.jpg", 800),
      img("cat_img/PGREY_S_1771246837549_xebaounw5ob3g57.jpg", 800),
      img("cat_img/PGREY_S_1771246839393_j0zaelh68r0h5dd.jpg", 800),
    ],
    category: "slides-slippers",
    rating: 4.5,
    reviews: 112,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Grey"],
    description: "Classic grey EVA slides with a premium textured footbed. Designed for relaxation and style with a cushioned sole.",
    fabric: "Premium EVA Material",
    bestSeller: true,
    badge: "66% OFF",
  },
  {
    id: "7",
    name: "Grey Premium Eva Clogs",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/PGYC_1771246827506_aixmgu2qe52ja0q.jpg"),
    hoverImage: img("cat_img/PGYC_1771246824070_6cz7pcwxx5cp5s7.jpg"),
    images: [
      img("cat_img/PGYC_1771246827506_aixmgu2qe52ja0q.jpg", 800),
      img("cat_img/PGYC_1771246824070_6cz7pcwxx5cp5s7.jpg", 800),
      img("cat_img/PGYC_1771246781052_96iqc8fgj1b14nz.jpg", 800),
    ],
    category: "crocs",
    rating: 4.6,
    reviews: 134,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Grey"],
    description: "Comfortable and stylish grey EVA clogs with modern design elements. Features anti-slip sole and ergonomic footbed.",
    fabric: "Premium EVA Material",
    trending: true,
    badge: "71% OFF",
  },
  {
    id: "8",
    name: "Black Premium Eva Slides",
    price: 399,
    originalPrice: 1198,
    image: img("cat_img/PGREY_S_1771246790819_grmpio7u5e8euac.jpg"),
    hoverImage: img("cat_img/PGREY_S_1771246837549_xebaounw5ob3g57.jpg"),
    images: [
      img("cat_img/PGREY_S_1771246790819_grmpio7u5e8euac.jpg", 800),
      img("cat_img/PGREY_S_1771246837549_xebaounw5ob3g57.jpg", 800),
    ],
    category: "slides-slippers",
    rating: 4.4,
    reviews: 178,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Black"],
    description: "Sleek black EVA slides with premium construction. Ultra-lightweight with a cushioned footbed for maximum comfort.",
    fabric: "Premium EVA Material",
    bestSeller: true,
    badge: "66% OFF",
  },
  {
    id: "9",
    name: "Brown Premium Sandal",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg"),
    hoverImage: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg"),
    images: [
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg", 800),
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg", 800),
    ],
    category: "loafer-sandals",
    rating: 4.5,
    reviews: 96,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Brown"],
    description: "Premium brown sandal with superior comfort and craftsmanship. Features a cushioned insole and durable outsole for everyday wear.",
    fabric: "Premium PVC Material",
    trending: true,
    badge: "53% OFF",
  },
  {
    id: "10",
    name: "Black Premium Airmix Sandal",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg"),
    hoverImage: img("cat_img/PMGRYC_1771246777782_zvsql2d77l5lwbc.jpg"),
    images: [
      img("cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg", 800),
      img("cat_img/PMGRYC_1771246777782_zvsql2d77l5lwbc.jpg", 800),
    ],
    category: "loafer-sandals",
    rating: 4.7,
    reviews: 58,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Black"],
    description: "Premium black Airmix sandal with advanced cushioning technology. Lightweight and durable for all-day comfort.",
    fabric: "Premium Airmix Material",
    bestSeller: true,
    badge: "53% OFF",
  },
  {
    id: "11",
    name: "Mehandi Green Double Color Clogs",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/PGYC_1771246827506_aixmgu2qe52ja0q.jpg"),
    hoverImage: img("cat_img/PGYC_1771246824070_6cz7pcwxx5cp5s7.jpg"),
    images: [
      img("cat_img/PGYC_1771246827506_aixmgu2qe52ja0q.jpg", 800),
      img("cat_img/PGYC_1771246824070_6cz7pcwxx5cp5s7.jpg", 800),
    ],
    category: "crocs",
    rating: 4.2,
    reviews: 82,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Mehandi Green"],
    description: "Eye-catching double color clogs in mehandi green. Soft quality material with a comfortable fit for daily wear.",
    fabric: "Soft Quality EVA",
    newArrival: true,
    badge: "71% OFF",
  },
  {
    id: "12",
    name: "Tan Premium Airmix Sandal",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg"),
    hoverImage: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg"),
    images: [
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg", 800),
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg", 800),
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
    id: "13",
    name: "Black And Tan Airmix Sandal Combo",
    price: 1199,
    originalPrice: 2399,
    image: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg"),
    hoverImage: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg"),
    images: [
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg", 800),
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg", 800),
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
    id: "14",
    name: "Brown Premium PVC Sandal",
    price: 599,
    originalPrice: 1299,
    image: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg"),
    hoverImage: img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg"),
    images: [
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_5RN9CR4YVZ_2026-03-05_1.jpg", 800),
      img("cat_img/Brown_Mens_Premium_QualityAirmix_Sandls_CO7TAKS2BN_2026-03-05_2.jpg", 800),
    ],
    category: "loafer-sandals",
    rating: 4.4,
    reviews: 72,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Brown"],
    description: "Durable brown PVC sandal with a classic design. Water-resistant and easy to maintain, perfect for monsoon season.",
    fabric: "Premium PVC Material",
    badge: "53% OFF",
  },
  {
    id: "15",
    name: "Navy Sky Double Color Clogs",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg"),
    hoverImage: img("cat_img/PMGRYC_1771246787454_g0l8v53wev2y24r.jpg"),
    images: [
      img("cat_img/PMGRYC_1771246780244_h6fuhmxff5lcizc.jpg", 800),
      img("cat_img/PMGRYC_1771246787454_g0l8v53wev2y24r.jpg", 800),
    ],
    category: "crocs",
    rating: 4.3,
    reviews: 95,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Navy", "Sky Blue"],
    description: "Vibrant navy-sky dual-color clogs with a playful design. Lightweight EVA construction with ventilation ports.",
    fabric: "Soft Quality EVA",
    newArrival: true,
    badge: "71% OFF",
  },
  {
    id: "16",
    name: "Sky Premium Eva Clogs",
    price: 449,
    originalPrice: 1598,
    image: img("cat_img/PGYC_1771246827506_aixmgu2qe52ja0q.jpg"),
    hoverImage: img("cat_img/PGYC_1771246781052_96iqc8fgj1b14nz.jpg"),
    images: [
      img("cat_img/PGYC_1771246827506_aixmgu2qe52ja0q.jpg", 800),
      img("cat_img/PGYC_1771246781052_96iqc8fgj1b14nz.jpg", 800),
    ],
    category: "crocs",
    rating: 4.4,
    reviews: 88,
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Sky Blue"],
    description: "Fresh sky blue EVA clogs that combine comfort with style. Anti-slip sole and ergonomic design for all-day wear.",
    fabric: "Premium EVA Material",
    trending: true,
    badge: "71% OFF",
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
