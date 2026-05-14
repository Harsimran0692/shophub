import express from "express";
import {
  cancelOrder,
  createOrder,
  getOrders,
} from "../controller/orderController.js";
import authenticateUser from "../middlewares/authenticateUser.js";

export const orderRoute = express.Router();

orderRoute.post("/create", authenticateUser, createOrder);
orderRoute.get("/get", authenticateUser, getOrders);
orderRoute.patch("/cancel", authenticateUser, cancelOrder);
