import express from "express";
import {
  getCategories,
  getCategorySpecs,
  getCategorySpecsById,
  setCategorySpecs,
} from "../controller/categoryController.js";

export const categoryRoute = express.Router();

categoryRoute.get("/", getCategories);
categoryRoute.get("/category-specs", getCategorySpecs);
categoryRoute.post("/category-specs/:categoryId", setCategorySpecs);
categoryRoute.get("/category-specs/:categoryId", getCategorySpecsById);
