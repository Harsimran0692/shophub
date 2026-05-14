import express from "express";
import {
  createProduct,
  getProduct,
  getProducts,
  searchProduct,
} from "../controller/productController.js";

export const productRoute = express.Router();

productRoute.get("/", getProducts);
productRoute.post("/", createProduct);
productRoute.get("/search-products", searchProduct);
productRoute.get("/:id", getProduct);
