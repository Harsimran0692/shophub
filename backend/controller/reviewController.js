import reviewModel from "../models/review.js";

export const addReview = async (req, res) => {
  try {
    const user = req.user.id;
    const { product, rating, comment } = req.body;

    if (!user || !product || !rating || !comment) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    const existingReview = await reviewModel.findOne({ user, product });
    if (existingReview) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    const review = await reviewModel.create({ user, product, rating, comment });
    const populatedReview = await review.populate("user");
    return res
      .status(201)
      .json({ data: populatedReview, message: "Review added successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error " + error,
    });
  }
};

export const getReviewsById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Id is required" });
    }

    const reviews = await reviewModel
      .find({ product: productId })
      .populate("user", "name email profileImage")
      .sort({ createdAt: -1 });

    if (!reviews) {
      return res.status(400).json({ message: "No product found." });
    }

    return res.status(200).json({
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error " + error,
    });
  }
};
