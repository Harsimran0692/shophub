import express from "express";
import {
  createOrUpdateCart,
  deleteCartItem,
  getCart,
  updateCartItem,
} from "../controller/cartController.js";
import authenticateUser from "../middlewares/authenticateUser.js";
export const cartRouter = express.Router();

cartRouter.get("/", authenticateUser, getCart);
cartRouter.post("/add", authenticateUser, createOrUpdateCart);
cartRouter.put("/update", authenticateUser, updateCartItem);
cartRouter.delete("/remove/:productId", authenticateUser, deleteCartItem);
