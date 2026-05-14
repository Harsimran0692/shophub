import mongoose from "mongoose";
import productModel from "./product.js";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    images: {
      type: String,
      altText: String,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

reviewSchema.post("save", async function () {
  const result = await reviewModel.aggregate([
    { $match: { product: this.product } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);
  const allReviews = await reviewModel.find();
  console.log("Product: " + this.product);
  console.log("result: " + result[0]?.avgRating);
  console.log("count: " + result[0]?.count);
  console.log(allReviews);
  await productModel.findByIdAndUpdate(this.product, {
    averageRating: result[0]?.avgRating || 0,
    totalReviews: result[0]?.count || 0,
    reviews: allReviews,
  });
});

const reviewModel = mongoose.model("reviews", reviewSchema);

export default reviewModel;
