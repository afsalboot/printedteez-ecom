import logo from "../assets/Logo.png";
import hero1 from "../assets/heroSection1.png";
import hero2 from "../assets/heroSection2.png";

export {
  logo,
  hero1,
  hero2,
}


export const categories = [
  "Basic Tee",
  "T-shirt",
  "Oversized Tee",
  "Polo T-shirt",
  "Tank Top",
  "Crop Top",
  "Long Sleeve Tee",
  "Raglan Sleeve Tee",
  "Henley Tee",
];

export const sexOptions = ["Men", "Women", "Unisex"];

export const materialOptions = [
  "100% Cotton",
  "Cotton Blend",
  "Polyester",
  "Poly-Cotton",
  "Heavy Cotton (240 GSM)",
  "Dry Fit",
  "Premium Fabric",
  "Organic Cotton",
];

export const fabricWeights = ["160 GSM", "180 GSM", "200 GSM", "220 GSM", "240 GSM"];

export const patternOptions = [
  "Solid",
  "Printed",
  "Graphic",
  "Striped",
  "Color Block",
  "Tie Dye",
  "Embroidered",
  "Minimal",
];

export const fitOptions = ["Regular Fit", "Oversized Fit", "Slim Fit", "Loose Fit"];

export const neckOptions = [
  "Round Neck",
  "Crew Neck",
  "V-Neck",
  "Polo Collar",
  "Henley Neck",
];

export const sleeveOptions = ["Half Sleeve", "Full Sleeve", "Sleeveless"];



export const collectionsList = [
  "Streetwear",
  "Anime",
  "Minimal",
  "Retro",
  "Vintage",
  "Sports",
  "Gym",
  "Summer",
  "Winter",
  "Festival",
  "Couple Wear",
  "Trending",
  "New Arrivals",
  "Best Sellers",
  "Limited Edition",
];

export const fieldLabels = {
  sexCategory: "Gender",
  material: "Material",
  fabricWeight: "Fabric Weight",
  pattern: "Pattern",
  fitType: "Fit Type",
  neckType: "Neck Type",
  sleeveType: "Sleeve Type",
};

export const SECTION_TYPES = [
  { value: "categories", label: "Categories Section" },
  { value: "flash_sale", label: "Flash Sale" },
  { value: "featured", label: "Featured Products" },
  { value: "trending", label: "Trending Products" },
  { value: "new_arrivals", label: "New Arrivals" },
  { value: "best_sellers", label: "Best Sellers" },
  { value: "limited_edition", label: "Limited Edition" },
  { value: "deals", label: "Deals & Offers" }
];
