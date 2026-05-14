import productModel from "../models/product.js";

const products = [
  {
    name: "Wireless Noise-Cancelling Headphones",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?fit=crop&w=800&q=80",
        altText: "Black wireless headphones",
      },
    ],
    price: 199.99,
    discountedPrice: 179.99,
    description:
      "High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality.",
    category: "6869aa97361e5122a616c34c",
    isFeatured: true,
    isDeal: true,
    isAvailable: true,
    stock: 50,
    specs: {
      material: "Plastic and leather",
      weight: { value: 250, unit: "g" },
      colors: ["Black", "Silver"],
      dimensions: { length: 20, width: 18, height: 8, unit: "cm" },
    },
    averageRating: 4.5,
  },
  {
    name: "4K Smart LED TV 55-Inch",
    images: [
      {
        url: "https://images.unsplash.com/photo-1593359677879-a4a89d7a32f2?fit=crop&w=800&q=80",
        altText: "55-inch smart TV",
      },
    ],
    price: 599.99,
    description:
      "55-inch 4K Ultra HD Smart LED TV with HDR, built-in streaming apps, and voice control compatibility.",
    category: "6869aa97361e5122a616c34c",
    isAvailable: true,
    stock: 20,
    specs: {
      material: "Metal and plastic",
      weight: { value: 15, unit: "kg" },
      dimensions: { length: 123, width: 8, height: 71, unit: "cm" },
      colors: ["Black"],
    },
    averageRating: 4.7,
  },
  {
    name: "Smartphone 128GB",
    images: [
      {
        url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?fit=crop&w=800&q=80",
        altText: "Black smartphone",
      },
    ],
    price: 799.99,
    discountedPrice: 749.99,
    description:
      "Latest smartphone with 128GB storage, 6.5-inch AMOLED display, and triple camera system.",
    category: "6869aa97361e5122a616c34c",
    isFeatured: true,
    isAvailable: true,
    stock: 100,
    specs: {
      material: "Glass and aluminum",
      weight: { value: 190, unit: "g" },
      colors: ["Black", "Blue", "White"],
      dimensions: { length: 16, width: 7.5, height: 0.8, unit: "cm" },
    },
    averageRating: 4.8,
  },
  {
    name: "Men's Casual Cotton T-Shirt",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?fit=crop&w=800&q=80",
        altText: "White cotton t-shirt",
      },
    ],
    price: 19.99,
    description:
      "Soft and comfortable men's cotton t-shirt, perfect for casual wear.",
    category: "6869aa97361e5122a616c34d",
    isAvailable: true,
    stock: 200,
    specs: {
      material: "100% Cotton",
      colors: ["White", "Black", "Navy"],
      sizes: ["S", "M", "L", "XL"],
    },
    averageRating: 4.3,
  },
  {
    name: "Women's Denim Jacket",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544027993-37a781a7713e?fit=crop&w=800&q=80",
        altText: "Blue denim jacket",
      },
    ],
    price: 59.99,
    discountedPrice: 49.99,
    description:
      "Stylish women's denim jacket with a relaxed fit, ideal for layering.",
    category: "6869aa97361e5122a616c34d",
    isDeal: true,
    isAvailable: true,
    stock: 80,
    specs: {
      material: "Denim",
      colors: ["Blue"],
      sizes: ["XS", "S", "M", "L"],
    },
    averageRating: 4.6,
  },
  {
    name: "Athletic Running Shorts",
    images: [
      {
        url: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?fit=crop&w=800&q=80",
        altText: "Black running shorts",
      },
    ],
    price: 29.99,
    description:
      "Lightweight and breathable athletic shorts for running and workouts.",
    category: "6869aa97361e5122a616c34d",
    isAvailable: true,
    stock: 150,
    specs: {
      material: "Polyester",
      colors: ["Black", "Grey"],
      sizes: ["S", "M", "L"],
    },
    averageRating: 4.4,
  },
  {
    name: "Science Fiction Novel",
    images: [
      {
        url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?fit=crop&w=800&q=80",
        altText: "Science fiction book cover",
      },
    ],
    price: 14.99,
    description:
      "An epic science fiction novel exploring interstellar travel and human survival.",
    category: "6869aa97361e5122a616c34e",
    isFeatured: true,
    isAvailable: true,
    stock: 300,
    specs: {
      material: "Paper",
      weight: { value: 400, unit: "g" },
      dimensions: { length: 20, width: 13, height: 3, unit: "cm" },
    },
    averageRating: 4.9,
  },
  {
    name: "Self-Help Guide",
    images: [
      {
        url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?fit=crop&w=800&q=80",
        altText: "Self-help book cover",
      },
    ],
    price: 12.99,
    description:
      "A practical guide to personal growth and achieving life goals.",
    category: "6869aa97361e5122a616c34e",
    isAvailable: true,
    stock: 250,
    specs: {
      material: "Paper",
      weight: { value: 300, unit: "g" },
      dimensions: { length: 18, width: 12, height: 2, unit: "cm" },
    },
    averageRating: 4.5,
  },
  {
    name: "Historical Biography",
    images: [
      {
        url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?fit=crop&w=800&q=80",
        altText: "Biography book cover",
      },
    ],
    price: 18.99,
    description:
      "A detailed biography of a prominent historical figure, rich with insights.",
    category: "6869aa97361e5122a616c34e",
    isAvailable: true,
    stock: 200,
    specs: {
      material: "Paper",
      weight: { value: 500, unit: "g" },
      dimensions: { length: 22, width: 15, height: 4, unit: "cm" },
    },
    averageRating: 4.7,
  },
  {
    name: "Stainless Steel Cookware Set",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=800&q=80",
        altText: "Stainless steel pots and pans",
      },
    ],
    price: 129.99,
    description:
      "10-piece stainless steel cookware set, durable and suitable for all stovetops.",
    category: "6869aa97361e5122a616c34f",
    isAvailable: true,
    stock: 40,
    specs: {
      material: "Stainless Steel",
      weight: { value: 8, unit: "kg" },
      colors: ["Silver"],
    },
    averageRating: 4.6,
  },
  {
    name: "Digital Kitchen Scale",
    images: [
      {
        url: "https://images.unsplash.com/photo-1571847140471-1d7766cc6581?fit=crop&w=800&q=80",
        altText: "Digital kitchen scale",
      },
    ],
    price: 24.99,
    discountedPrice: 19.99,
    description:
      "Accurate digital kitchen scale with LCD display, up to 11 pounds capacity.",
    category: "6869aa97361e5122a616c34f",
    isDeal: true,
    isAvailable: true,
    stock: 100,
    specs: {
      material: "Plastic and glass",
      weight: { value: 500, unit: "g" },
      dimensions: { length: 20, width: 15, height: 2, unit: "cm" },
      colors: ["Black"],
    },
    averageRating: 4.8,
  },
  {
    name: "Memory Foam Pillow",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=800&q=80",
        altText: "White memory foam pillow",
      },
    ],
    price: 39.99,
    description:
      "Ergonomic memory foam pillow for comfortable sleep, with breathable cover.",
    category: "6869aa97361e5122a616c34f",
    isAvailable: true,
    stock: 60,
    specs: {
      material: "Memory Foam",
      weight: { value: 1.2, unit: "kg" },
      dimensions: { length: 60, width: 40, height: 12, unit: "cm" },
      colors: ["White"],
    },
    averageRating: 4.5,
  },
  {
    name: "Yoga Mat",
    images: [
      {
        url: "https://images.unsplash.com/photo-1592432709974-741b75507903?fit=crop&w=800&q=80",
        altText: "Green yoga mat",
      },
    ],
    price: 29.99,
    description:
      "Non-slip yoga mat, 4mm thick, ideal for yoga, pilates, and home workouts.",
    category: "6869aa97361e5122a616c350",
    isAvailable: true,
    stock: 120,
    specs: {
      material: "PVC",
      weight: { value: 1, unit: "kg" },
      dimensions: { length: 183, width: 61, height: 0.4, unit: "cm" },
      colors: ["Green", "Blue", "Purple"],
    },
    averageRating: 4.4,
  },
  {
    name: "Camping Tent 4-Person",
    images: [
      {
        url: "https://images.unsplash.com/photo-1504851149312-7b445ff0501d?fit=crop&w=800&q=80",
        altText: "Green camping tent",
      },
    ],
    price: 99.99,
    description:
      "Waterproof 4-person camping tent with easy setup, perfect for outdoor adventures.",
    category: "6869aa97361e5122a616c350",
    isAvailable: true,
    stock: 30,
    specs: {
      material: "Polyester",
      weight: { value: 5, unit: "kg" },
      dimensions: { length: 240, width: 210, height: 120, unit: "cm" },
      colors: ["Green"],
    },
    averageRating: 4.7,
  },
  {
    name: "Running Shoes",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?fit=crop&w=800&q=80",
        altText: "Black running shoes",
      },
    ],
    price: 79.99,
    description:
      "Lightweight running shoes with cushioned soles for comfort and performance.",
    category: "6869aa97361e5122a616c350",
    isAvailable: true,
    stock: 90,
    specs: {
      material: "Mesh and rubber",
      weight: { value: 300, unit: "g" },
      colors: ["Black", "White"],
      sizes: ["US 7", "US 8", "US 9", "US 10"],
    },
    averageRating: 4.6,
  },
  {
    name: "Moisturizing Face Cream",
    images: [
      {
        url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?fit=crop&w=800&q=80",
        altText: "Face cream jar",
      },
    ],
    price: 24.99,
    description:
      "Hydrating face cream with natural ingredients, suitable for all skin types.",
    category: "6869aa97361e5122a616c351",
    isAvailable: true,
    stock: 150,
    specs: {
      material: "Cream",
      weight: { value: 50, unit: "g" },
      dimensions: { length: 5, width: 5, height: 4, unit: "cm" },
    },
    averageRating: 4.5,
  },
  {
    name: "Hair Oil Serum",
    images: [
      {
        url: "https://images.unsplash.com/photo-1587049633410-827b5a6f74f4?fit=crop&w=800&q=80",
        altText: "Hair oil bottle",
      },
    ],
    price: 19.99,
    description: "Nourishing hair oil serum to promote shine and reduce frizz.",
    category: "6869aa97361e5122a616c351",
    isAvailable: true,
    stock: 200,
    specs: {
      material: "Oil",
      weight: { value: 100, unit: "g" },
      dimensions: { length: 4, width: 4, height: 12, unit: "cm" },
    },
    averageRating: 4.3,
  },
  {
    name: "Electric Toothbrush",
    images: [
      {
        url: "https://images.unsplash.com/photo-1607007371406-c26d9e593873?fit=crop&w=800&q=80",
        altText: "White electric toothbrush",
      },
    ],
    price: 49.99,
    description:
      "Rechargeable electric toothbrush with multiple brushing modes.",
    category: "6869aa97361e5122a616c351",
    isAvailable: true,
    stock: 80,
    specs: {
      material: "Plastic",
      weight: { value: 150, unit: "g" },
      colors: ["White", "Black"],
      dimensions: { length: 3, width: 3, height: 20, unit: "cm" },
    },
    averageRating: 4.8,
  },
  {
    name: "Wooden Building Blocks Set",
    images: [
      {
        url: "https://images.unsplash.com/photo-1518715307690-6a6e6d3bcdb6?fit=crop&w=800&q=80",
        altText: "Colorful wooden blocks",
      },
    ],
    price: 34.99,
    description:
      "100-piece wooden building blocks set, safe for kids and encourages creativity.",
    category: "6869aa97361e5122a616c352",
    isAvailable: true,
    stock: 100,
    specs: {
      material: "Wood",
      weight: { value: 2, unit: "kg" },
      dimensions: { length: 30, width: 20, height: 10, unit: "cm" },
      colors: ["Multicolor"],
    },
    averageRating: 4.7,
  },
  {
    name: "Board Game for Kids",
    images: [
      {
        url: "https://images.unsplash.com/photo-1606167668669-631edcce33b6?fit=crop&w=800&q=80",
        altText: "Family board game",
      },
    ],
    price: 24.99,
    description:
      "Fun and educational board game for kids aged 6 and up, promotes teamwork.",
    category: "6869aa97361e5122a616c352",
    isAvailable: true,
    stock: 150,
    specs: {
      material: "Cardboard and plastic",
      weight: { value: 800, unit: "g" },
      dimensions: { length: 25, width: 25, height: 5, unit: "cm" },
    },
    averageRating: 4.5,
  },
  {
    name: "Remote Control Drone",
    images: [
      {
        url: "https://images.unsplash.com/photo-1508614589041-895b88991e68?fit=crop&w=800&q=80",
        altText: "Black drone",
      },
    ],
    price: 89.99,
    description:
      "Quadcopter drone with HD camera and remote control, suitable for ages 12+.",
    category: "6869aa97361e5122a616c352",
    isAvailable: true,
    stock: 50,
    specs: {
      material: "Plastic",
      weight: { value: 300, unit: "g" },
      dimensions: { length: 30, width: 30, height: 10, unit: "cm" },
      colors: ["Black"],
    },
    averageRating: 4.6,
  },
  {
    name: "Modern Coffee Table",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=800&q=80",
        altText: "Wooden coffee table",
      },
    ],
    price: 199.99,
    description:
      "Sleek wooden coffee table with minimalist design, perfect for living rooms.",
    category: "6869aa97361e5122a616c353",
    isAvailable: true,
    stock: 25,
    specs: {
      material: "Wood and metal",
      weight: { value: 20, unit: "kg" },
      dimensions: { length: 120, width: 60, height: 45, unit: "cm" },
      colors: ["Brown", "Black"],
    },
    averageRating: 4.5,
  },
  {
    name: "Ergonomic Office Chair",
    images: [
      {
        url: "https://images.unsplash.com/photo-1581456495146-65a71b2d7f3a?fit=crop&w=800&q=80",
        altText: "Black office chair",
      },
    ],
    price: 149.99,
    description:
      "Adjustable ergonomic office chair with lumbar support for all-day comfort.",
    category: "6869aa97361e5122a616c353",
    isAvailable: true,
    stock: 40,
    specs: {
      material: "Mesh and plastic",
      weight: { value: 15, unit: "kg" },
      dimensions: { length: 60, width: 60, height: 120, unit: "cm" },
      colors: ["Black"],
    },
    averageRating: 4.7,
  },
  {
    name: "Queen-Size Bed Frame",
    images: [
      {
        url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?fit=crop&w=800&q=80",
        altText: "Wooden bed frame",
      },
    ],
    price: 299.99,
    description: "Sturdy queen-size wooden bed frame with modern design.",
    category: "6869aa97361e5122a616c353",
    isAvailable: true,
    stock: 15,
    specs: {
      material: "Wood",
      weight: { value: 50, unit: "kg" },
      dimensions: { length: 210, width: 160, height: 90, unit: "cm" },
      colors: ["Brown"],
    },
    averageRating: 4.8,
  },
  {
    name: "Silver Hoop Earrings",
    images: [
      {
        url: "https://images.unsplash.com/photo-1608042314453-ec68b614315a?fit=crop&w=800&q=80",
        altText: "Silver hoop earrings",
      },
    ],
    price: 39.99,
    description:
      "Elegant sterling silver hoop earrings, perfect for daily wear.",
    category: "6869aa97361e5122a616c354",
    isAvailable: true,
    stock: 200,
    specs: {
      material: "Sterling Silver",
      weight: { value: 5, unit: "g" },
      dimensions: { length: 3, width: 3, height: 0.1, unit: "cm" },
    },
    averageRating: 4.5,
  },
  {
    name: "Gold Chain Necklace",
    images: [
      {
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c2a?fit=crop&w=800&q=80",
        altText: "Gold necklace",
      },
    ],
    price: 59.99,
    description: "18-inch gold-plated chain necklace with minimalist design.",
    category: "6869aa97361e5122a616c354",
    isAvailable: true,
    stock: 150,
    specs: {
      material: "Gold-plated",
      weight: { value: 10, unit: "g" },
      dimensions: { length: 45, unit: "cm" },
    },
    averageRating: 4.6,
  },
  {
    name: "Gemstone Ring",
    images: [
      {
        url: "https://images.unsplash.com/photo-1608042314453-f55a?fit=crop&w=800&q=80",
        altText: "Blue gemstone ring",
      },
    ],
    price: 79.99,
    description:
      "Sterling silver ring with a blue sapphire gemstone, sizes available.",
    category: "6869aa97361e5122a616c354",
    isAvailable: true,
    stock: 100,
    specs: {
      material: "Sterling Silver and Sapphire",
      weight: { value: 8, unit: "g" },
      sizes: ["6", "7", "8"],
    },
    averageRating: 4.7,
  },
  {
    name: "Car Floor Mats",
    images: [
      {
        url: "https://images.unsplash.com/photo-1618762234638-8a284b484d3b?fit=crop&w=800&q=80",
        altText: "Black car floor mats",
      },
    ],
    price: 49.99,
    description:
      "All-weather rubber car floor mats, fits most vehicles, easy to clean.",
    category: "6869aa97361e5122a616c355",
    isAvailable: true,
    stock: 80,
    specs: {
      material: "Rubber",
      weight: { value: 4, unit: "kg" },
      dimensions: { length: 80, width: 50, height: 2, unit: "cm" },
      colors: ["Black"],
    },
    averageRating: 4.5,
  },
  {
    name: "Portable Car Vacuum Cleaner",
    images: [
      {
        url: "https://images.unsplash.com/photo-1581235720704-06d1018153bf?fit=crop&w=800&q=80",
        altText: "Black car vacuum cleaner",
      },
    ],
    price: 39.99,
    description:
      "Compact car vacuum cleaner with strong suction, 12V power adapter.",
    category: "6869aa97361e5122a616c355",
    isAvailable: true,
    stock: 100,
    specs: {
      material: "Plastic",
      weight: { value: 1, unit: "kg" },
      dimensions: { length: 35, width: 10, height: 10, unit: "cm" },
      colors: ["Black"],
    },
    averageRating: 4.4,
  },
  {
    name: "Car Phone Mount",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?fit=crop&w=800&q=80",
        altText: "Black phone mount",
      },
    ],
    price: 19.99,
    description:
      "Universal car phone mount with adjustable grip, fits most smartphones.",
    category: "6869aa97361e5122a616c355",
    isAvailable: true,
    stock: 150,
    specs: {
      material: "Plastic",
      weight: { value: 100, unit: "g" },
      dimensions: { length: 10, width: 8, height: 12, unit: "cm" },
      colors: ["Black"],
    },
    averageRating: 4.6,
  },
];

for (let [key, val] of Object.entries(products)) {
  console.log(products[key]);
}

// Insert products into MongoDB
// productModel.insertMany(products);
