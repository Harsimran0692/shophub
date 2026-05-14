import { sanitizeFilter } from "mongoose";
import redis from "../config/redis.js";
import productModel from "../models/product.js";
import validateObject from "../utils/validateObject.js";
import categoryModel from "../models/category.js";
import validateProductId from "../utils/validateProductId.js";

export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "asc",
      category,
      isFeatured,
      isDeal,
      isAvailable,
      search,
      minPrice,
      maxPrice,
    } = req.query;

    // Cache key based on query parameters
    const cacheKey = `products:${page}:${limit}:${sort}:${order}:${
      category || ""
    }:${isFeatured || ""}:${isDeal || ""}:${isAvailable || ""}:${
      search || ""
    }:${minPrice || ""}:${maxPrice || ""}`;

    const cachedProducts = await redis.get(cacheKey);
    // await redis.del(cacheKey);

    // console.log(cachedProducts);
    // if (cachedProducts) {
    //   return res.status(200).json({
    //     status: "success",
    //     data: JSON.parse(cachedProducts),
    //     source: "cache",
    //     meta: { page: Number(page), limit: Number(limit) },
    //   });
    // }

    const query = { isDeleted: false };

    if (category) query.category = category;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === "true";
    if (isDeal !== undefined) query.isDeal = isDeal === "true";
    if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $regex: search, $options: "i" };
    }

    const sortOption = {};
    sortOption[sort] = order === "asc" ? 1 : -1;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(Number(limit), 100)); // Cap limit at 100
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      productModel
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      productModel.countDocuments(query),
    ]);

    if (products.length === 0) {
      return res.status(201).json({
        status: "success",
        data: [],
        source: "Database",
      });
    }

    const responseData = {
      products,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
      },
    };

    // console.log(responseData);

    // await redis.set(cacheKey, JSON.stringify(responseData), "EX", 3600);

    res.status(200).json({
      status: "success",
      data: responseData,
      source: "Database",
    });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

export const getProduct = async (req, res) => {
  try {
    let productId = sanitizeFilter(req.params.id);
    const productCacheKey = `product:${productId}`;

    if (!validateObject(productId)) {
      throw new Error("Invalid product id");
    }
    let isProductAvailable = await validateProductId(productId);
    if (!isProductAvailable) {
      await redis.del(productCacheKey);
    }

    const cachedProduct = await redis.get(productCacheKey);

    // if (cachedProduct) {
    //   return res.status(200).json({
    //     status: "success",
    //     data: JSON.parse(cachedProduct),
    //     source: "Cache",
    //   });
    // }

    const populatedFields = [{ path: "category", select: "name" }];

    let product = await productModel
      .findOne({
        _id: productId,
        isDeleted: false,
      })
      .populate(populatedFields)
      .lean()
      .exec();

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    productModel
      .updateOne(
        {
          _id: productId,
        },
        { $inc: { viewCount: 1 } }
      )
      .catch((err) =>
        console.error(`Failed to increment viewCount ${err.message}`)
      );

    await redis.set(productCacheKey, JSON.stringify(product), "EX", 3600);

    res.status(200).json({
      status: "success",
      data: product,
      source: "Database",
    });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

export const createProduct = async (req, res) => {
  try {
    // Sanitize and validate input
    const {
      name,
      images,
      price,
      discountedPrice,
      description,
      category,
      isFeatured = false,
      isDeal = false,
      isAvailable = true,
      stock = 0,
      specs,
      averageRating = 0,
    } = sanitizeFilter(req.body);

    // Validate required fields
    if (!name || !price || !description || !category) {
      return res.status(400).json({
        status: "Error",
        message: "Missing required fields: name, price, description, category",
      });
    }

    // Validate ObjectId for category
    if (!validateObject(category)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid category ID",
      });
    }

    // Verify category exists
    const categoryExists = await categoryModel.findById(category).lean();
    if (!categoryExists) {
      return res.status(400).json({
        status: "Error",
        message: "Category not found",
      });
    }

    // Validate images array
    if (images && !Array.isArray(images)) {
      return res.status(400).json({
        status: "Error",
        message: "Images must be an array",
      });
    }

    // Validate price and discountedPrice
    if (typeof price !== "number" || price < 0) {
      return res.status(400).json({
        status: "Error",
        message: "Price must be a non-negative number",
      });
    }
    if (
      discountedPrice !== undefined &&
      (typeof discountedPrice !== "number" ||
        discountedPrice < 0 ||
        discountedPrice > price)
    ) {
      return res.status(400).json({
        status: "Error",
        message:
          "Discounted price must be a non-negative number and less than or equal to price",
      });
    }

    // Validate stock
    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({
        status: "Error",
        message: "Stock must be a non-negative number",
      });
    }

    // Validate specs if provided
    if (specs) {
      if (specs.material && typeof specs.material !== "string") {
        return res.status(400).json({
          status: "Error",
          message: "Specs.material must be a string",
        });
      }
      if (specs.dimensions) {
        if (
          (specs.dimensions.length &&
            typeof specs.dimensions.length !== "number") ||
          (specs.dimensions.width &&
            typeof specs.dimensions.width !== "number") ||
          (specs.dimensions.height &&
            typeof specs.dimensions.height !== "number") ||
          (specs.dimensions.unit &&
            !["cm", "m", "in", "ft", null].includes(specs.dimensions.unit))
        ) {
          return res.status(400).json({
            status: "Error",
            message: "Invalid dimensions in specs",
          });
        }
      }
      if (specs.weight) {
        if (
          (specs.weight.value && typeof specs.weight.value !== "number") ||
          (specs.weight.unit &&
            !["g", "kg", "lb", "oz", null].includes(specs.weight.unit))
        ) {
          return res.status(400).json({
            status: "Error",
            message: "Invalid weight in specs",
          });
        }
      }
      if (specs.colors && !Array.isArray(specs.colors)) {
        return res.status(400).json({
          status: "Error",
          message: "Specs.colors must be an array",
        });
      }
      if (specs.sizes && !Array.isArray(specs.sizes)) {
        return res.status(400).json({
          status: "Error",
          message: "Specs.sizes must be an array",
        });
      }
    }

    // Validate averageRating
    if (
      typeof averageRating !== "number" ||
      averageRating < 0 ||
      averageRating > 5
    ) {
      return res.status(400).json({
        status: "Error",
        message: "Average rating must be a number between 0 and 5",
      });
    }

    // Create product
    const productData = {
      name: name.trim(),
      images: images || [],
      price,
      discountedPrice,
      description: description.trim(),
      category,
      isFeatured: !!isFeatured,
      isDeal: !!isDeal,
      isAvailable: !!isAvailable,
      stock,
      specs: specs || {},
      averageRating,
      isDeleted: false, // Explicitly set to ensure consistency
    };

    const product = await productModel.create(productData);

    // Invalidate cache for getProducts
    const cacheKeys = await redis.keys("products:*");
    if (cacheKeys.length > 0) {
      await redis.del(cacheKeys);
    }

    // Cache the new product for getProduct
    const productCacheKey = `product:${product._id}`;
    await redis.set(
      productCacheKey,
      JSON.stringify(product.toObject()),
      "EX",
      3600
    );

    res.status(201).json({
      status: "success",
      data: product,
      source: "Database",
    });
  } catch (error) {
    console.error("Error in createProduct:", error.message);
    res.status(500).json({
      status: "Error",
      message: error.message || "Internal server error",
    });
  }
};

export const searchProduct = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    if (!search || !search.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const filter = {
      $text: { $search: search },
      isAvailable: true,
    };

    if (category) {
      filter.category = category;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await productModel
      .find(filter, {
        score: { $meta: "textScore" }, // relevance score field
      })
      .sort({ score: { $meta: "textScore" } }) // best match first
      .skip(skip)
      .limit(Number(limit))
      .populate("category", "name");

    const totalCount = await productModel.countDocuments(filter);

    return res.status(200).json({
      status: "success",
      data: {
        products,
        meta: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error " + error });
  }
};
