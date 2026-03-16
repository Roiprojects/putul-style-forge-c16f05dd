import productTshirt from "@/assets/product-tshirt.jpg";
import productShirt from "@/assets/product-shirt.jpg";
import productJeans from "@/assets/product-jeans.jpg";
import productHoodie from "@/assets/product-hoodie.jpg";
import productJacket from "@/assets/product-jacket.jpg";
import productGraphicTee from "@/assets/product-graphic-tee.jpg";
import productLinenShirt from "@/assets/product-linen-shirt.jpg";
import productJoggers from "@/assets/product-joggers.jpg";
import productOversizedTee from "@/assets/product-oversized-tee.jpg";
import productDenimJacket from "@/assets/product-denim-jacket.jpg";
import productMinimalTee from "@/assets/product-minimal-tee.jpg";

import catTshirts from "@/assets/cat-tshirts.jpg";
import catShirts from "@/assets/cat-shirts.jpg";
import catJeans from "@/assets/cat-jeans.jpg";
import catJackets from "@/assets/cat-jackets.jpg";
import catHoodies from "@/assets/cat-hoodies.jpg";
import catCasual from "@/assets/cat-casual.jpg";
import catShoes from "@/assets/cat-shoes.jpg";

import productWhiteSneakers from "@/assets/product-white-sneakers.jpg";
import productLeatherLoafers from "@/assets/product-leather-loafers.jpg";
import productSportShoes from "@/assets/product-sport-shoes.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
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
}

export interface Category {
  name: string;
  image: string;
  slug: string;
}

export const categories: Category[] = [
  { name: "T-Shirts", image: catTshirts, slug: "t-shirts" },
  { name: "Shirts", image: catShirts, slug: "shirts" },
  { name: "Jeans", image: catJeans, slug: "jeans" },
  { name: "Jackets", image: catJackets, slug: "jackets" },
  { name: "Hoodies", image: catHoodies, slug: "hoodies" },
  { name: "Casual Wear", image: catCasual, slug: "casual-wear" },
  { name: "Shoes", image: catShoes, slug: "shoes" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Cotton T-Shirt",
    price: 1299,
    originalPrice: 1799,
    image: productTshirt,
    images: [productTshirt, productTshirt],
    category: "t-shirts",
    rating: 4.5,
    reviews: 128,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Navy"],
    description: "Crafted from 100% premium Supima cotton, this t-shirt offers an incredibly soft feel with a modern slim fit. Perfect for everyday wear.",
    fabric: "100% Supima Cotton, 180 GSM",
    bestSeller: true,
  },
  {
    id: "2",
    name: "Classic Casual Shirt",
    price: 2499,
    originalPrice: 3299,
    image: productShirt,
    images: [productShirt, productShirt],
    category: "shirts",
    rating: 4.7,
    reviews: 96,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue", "Beige"],
    description: "A timeless casual shirt with a relaxed fit. Features premium stitching and mother-of-pearl buttons for an elevated everyday look.",
    fabric: "100% Cotton Twill, 140 GSM",
    bestSeller: true,
  },
  {
    id: "3",
    name: "Slim Fit Denim Jeans",
    price: 2999,
    originalPrice: 3999,
    image: productJeans,
    images: [productJeans, productJeans],
    category: "jeans",
    rating: 4.6,
    reviews: 204,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Black", "Grey"],
    description: "Premium selvedge denim with a modern slim fit. Features slight stretch for all-day comfort without compromising on style.",
    fabric: "98% Cotton, 2% Elastane Denim",
    bestSeller: true,
  },
  {
    id: "4",
    name: "Street Style Hoodie",
    price: 2199,
    originalPrice: 2999,
    image: productHoodie,
    images: [productHoodie, productHoodie],
    category: "hoodies",
    rating: 4.4,
    reviews: 156,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey", "Olive"],
    description: "Heavyweight French terry hoodie with a relaxed silhouette. Features ribbed cuffs and a kangaroo pocket for ultimate streetwear comfort.",
    fabric: "80% Cotton, 20% Polyester French Terry, 380 GSM",
    bestSeller: true,
  },
  {
    id: "5",
    name: "Modern Fit Jacket",
    price: 4999,
    originalPrice: 6499,
    image: productJacket,
    images: [productJacket, productJacket],
    category: "jackets",
    rating: 4.8,
    reviews: 72,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Olive"],
    description: "A versatile bomber jacket with a modern fit. Water-resistant shell with premium satin lining. Perfect for transitional weather.",
    fabric: "Nylon Shell, Satin Lining",
    bestSeller: true,
  },
  {
    id: "6",
    name: "Graphic Print T-Shirt",
    price: 1499,
    originalPrice: 1999,
    image: productGraphicTee,
    images: [productGraphicTee, productGraphicTee],
    category: "t-shirts",
    rating: 4.3,
    reviews: 89,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    description: "Bold graphic print on premium cotton. Features a relaxed fit with reinforced neck ribbing for lasting comfort.",
    fabric: "100% Ring-Spun Cotton, 200 GSM",
    bestSeller: true,
  },
  {
    id: "7",
    name: "Casual Linen Shirt",
    price: 2799,
    image: productLinenShirt,
    images: [productLinenShirt, productLinenShirt],
    category: "shirts",
    rating: 4.5,
    reviews: 64,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Beige", "Sky Blue"],
    description: "Breathable linen shirt perfect for warm weather. Features a relaxed fit with rolled-up sleeve tabs.",
    fabric: "100% European Linen",
    bestSeller: true,
  },
  {
    id: "8",
    name: "Everyday Comfort Joggers",
    price: 1999,
    originalPrice: 2599,
    image: productJoggers,
    images: [productJoggers, productJoggers],
    category: "casual-wear",
    rating: 4.6,
    reviews: 178,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Grey", "Navy"],
    description: "Ultra-soft joggers with tapered legs and elastic cuffs. Features zippered pockets for secure storage on the go.",
    fabric: "65% Cotton, 35% Polyester Fleece",
    bestSeller: true,
  },
  {
    id: "9",
    name: "Oversized Streetwear T-Shirt",
    price: 1599,
    image: productOversizedTee,
    images: [productOversizedTee, productOversizedTee],
    category: "t-shirts",
    rating: 4.4,
    reviews: 112,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Olive"],
    description: "Drop-shoulder oversized tee with a heavyweight feel. The ultimate streetwear staple for a relaxed, contemporary look.",
    fabric: "100% Cotton, 240 GSM",
    trending: true,
  },
  {
    id: "10",
    name: "Urban Style Denim Jacket",
    price: 4499,
    originalPrice: 5999,
    image: productDenimJacket,
    images: [productDenimJacket, productDenimJacket],
    category: "jackets",
    rating: 4.7,
    reviews: 58,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Black"],
    description: "Classic denim jacket with a modern urban twist. Features antique brass buttons and distressed detailing.",
    fabric: "100% Heavy-Weight Denim",
    trending: true,
  },
  {
    id: "11",
    name: "Premium Cotton Casual Shirt",
    price: 2299,
    image: productShirt,
    images: [productShirt, productShirt],
    category: "shirts",
    rating: 4.5,
    reviews: 82,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Blue", "Pink"],
    description: "Soft-washed cotton shirt with a casual spread collar. Versatile enough for both office and weekend wear.",
    fabric: "100% Premium Cotton",
    trending: true,
  },
  {
    id: "12",
    name: "Minimalist Graphic Tee",
    price: 1399,
    image: productMinimalTee,
    images: [productMinimalTee, productMinimalTee],
    category: "t-shirts",
    rating: 4.2,
    reviews: 95,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Grey"],
    description: "Clean minimalist graphic on a premium cotton canvas. Subtle design for the understated fashion enthusiast.",
    fabric: "100% Organic Cotton, 190 GSM",
    trending: true,
  },
  {
    id: "13",
    name: "Classic White Sneakers",
    price: 3499,
    originalPrice: 4299,
    image: productWhiteSneakers,
    images: [productWhiteSneakers, productWhiteSneakers],
    category: "shoes",
    rating: 4.6,
    reviews: 142,
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["White", "White/Grey"],
    description: "Clean white leather sneakers with a minimalist design. Cushioned insole for all-day comfort. A wardrobe essential.",
    fabric: "Genuine Leather Upper, Rubber Sole",
    bestSeller: true,
  },
  {
    id: "14",
    name: "Premium Leather Loafers",
    price: 4999,
    originalPrice: 6299,
    image: productLeatherLoafers,
    images: [productLeatherLoafers, productLeatherLoafers],
    category: "shoes",
    rating: 4.8,
    reviews: 67,
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["Brown", "Black"],
    description: "Hand-stitched leather penny loafers with a timeless silhouette. Perfect for smart-casual occasions.",
    fabric: "Full-Grain Leather Upper, Leather Sole",
    trending: true,
  },
  {
    id: "15",
    name: "Sport Running Shoes",
    price: 2999,
    originalPrice: 3799,
    image: productSportShoes,
    images: [productSportShoes, productSportShoes],
    category: "shoes",
    rating: 4.5,
    reviews: 198,
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["Black", "Grey/Black"],
    description: "Lightweight mesh running shoes with responsive cushioning. Engineered for performance and everyday comfort.",
    fabric: "Knit Mesh Upper, EVA Midsole",
    bestSeller: true,
  },
];
