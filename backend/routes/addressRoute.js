import express from "express";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
  patchAddress,
} from "../controller/addressController.js";
import authenticateUser from "../middlewares/authenticateUser.js";

export const addressRoute = express.Router();

addressRoute.get("/", authenticateUser, getAddresses);
addressRoute.post("/add", authenticateUser, addAddress);
addressRoute.put("/update/:id", authenticateUser, updateAddress);
addressRoute.delete("/delete/:id", authenticateUser, deleteAddress);
addressRoute.patch("/patch/:id", authenticateUser, patchAddress);
