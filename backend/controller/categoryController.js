import categoryModel from "../models/category.js";
import redis from "../config/redis.js";
import categorySpec from "../models/categorySpec.js";

export const getCategories = async (req, res) => {
  try {
    const cachedKey = "allCategories";
    const cachedData = await redis.get(cachedKey);

    if (cachedData) {
      return res.status(200).json({
        status: "success",
        data: JSON.parse(cachedData),
        total: JSON.parse(cachedData).length,
        source: "Cache",
      });
    }

    const categories = await categoryModel
      .find()
      .lean()
      .sort({ createdAt: -1 });

    if (categories.length === 0) {
      return res.status(200).json({
        status: "success",
        data: [],
        source: "Database",
      });
    }
    await redis.set(cachedKey, JSON.stringify(categories), "EX", 3600);
    res.status(200).json({
      status: "success",
      data: categories,
      source: "Database",
    });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

export const setCategorySpecs = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { specField } = req.body;

    for (let field of specField) {
      if (!field.key || !field.label || !field.type) {
        return res.status(400).json({
          message: "Each specField must have key, label and type",
        });
      }
    }

    let checkCategory = await categoryModel.findById(categoryId);
    let checkCategorySpec = await categorySpec.findOne({
      category: categoryId,
    });

    if (!checkCategory) {
      return res.status(404).json({ message: "Invalid Category Id" });
    }
    if (checkCategorySpec) {
      return res.status(200).json({
        message: "Category Spec already exist",
        checkCategorySpec,
      });
    }

    const categorySpecData = {
      category: checkCategory,
      specField,
      version: 1,
    };

    const createCategorySpec = await categorySpec.create(categorySpecData);

    res
      .status(200)
      .json({ message: "Category Spec Created", createCategorySpec });
  } catch (error) {
    return res.status(500).json({ err: error.message });
  }
};

export const getCategorySpecs = async (req, res) => {
  const categorySpecs = await categorySpec.find().lean();
  if (categorySpecs.length === 0) {
    return res.status(200).json({
      status: "success",
      data: [],
      source: "Database",
    });
  }
  res.status(200).json({
    status: "success",
    data: categorySpecs,
    source: "Database",
  });
};

export const getCategorySpecsById = async (req, res) => {
  const categoryId = req.params.categoryId;

  if (!categoryId) {
    return res.status(400).json({ message: "categoryId is required" });
  }

  try {
    // Check Redis cache first
    const cacheKey = `categorySpecs:${categoryId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // Verify category exists
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // ✅ findOne since category is unique, populate ref, select specField
    const spec = await categorySpec
      .findOne({ category: categoryId })
      .populate("category", "name")
      .select("category specField version");

    if (!spec) {
      return res
        .status(404)
        .json({ message: "No specs found for this category" });
    }

    // Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(spec), "EX", 3600);

    return res.status(200).json(spec);
  } catch (error) {
    console.error("Error fetching category specs:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid categoryId format" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
