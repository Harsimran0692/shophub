import express from "express";
import authenticateUser from "../middlewares/authenticateUser.js";
import { addReview, getReviewsById } from "../controller/reviewController.js";

export const reviewRoute = express.Router();

reviewRoute.post("/postReview", authenticateUser, addReview);
reviewRoute.get("/:productId/review", getReviewsById);
