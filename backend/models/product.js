import mongoose from "mongoose";

// ─── Review Schema ────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for a review"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // fix: was "creatednotebookAt" typo
    },
  },
  { _id: true }
);

// ─── Product Schema ───────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        altText: {
          type: String,
          trim: true,
          maxlength: [100, "Alt text cannot exceed 100 characters"],
          default: "Product Image",
        },
      },
    ],

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    discountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
      default: null,
      validate: {
        validator: function (v) {
          return v === null || v === undefined || v <= this.price;
        },
        message: "Discounted price must be less than or equal to regular price",
      },
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: [true, "Category is required"],
    },

    // ── Dynamic specs (validated at app layer against CategorySpec) ──────────
    specs: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Tracks which CategorySpec version this product was saved against
    // Useful when spec definitions change — know which products need migration
    specVersion: {
      type: Number,
      default: 1,
    },

    // ── Flags ────────────────────────────────────────────────────────────────
    isFeatured: {
      type: Boolean,
      default: false,
    },

    isDeal: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ── Stats ────────────────────────────────────────────────────────────────
    viewCount: {
      type: Number,
      default: 0,
      min: [0, "View count cannot be negative"],
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    // ── Reviews ──────────────────────────────────────────────────────────────
    reviews: [reviewSchema],

    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Average rating cannot be less than 0"],
      max: [5, "Average rating cannot exceed 5"],
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: [0, "Total reviews cannot be negative"],
    },
  },
  {
    timestamps: true, // auto manages createdAt and updatedAt — no need to define manually
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isDeal: 1 });
productSchema.index({ isAvailable: 1 });
productSchema.index({ isDeleted: 1 });
productSchema.index({ viewCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 }); // for price range filtering
productSchema.index({ averageRating: -1 }); // for top rated sorting
productSchema.index({ category: 1, isAvailable: 1 }); // compound — common query pattern
productSchema.index({ category: 1, price: 1 }); // compound — filter by category + sort by price
productSchema.index(
  {
    name: "text",
    description: "text",
  },
  {
    weights: {
      name: 10, // name matches rank higher
      description: 2,
    },
  }
);

// ─── Pre-save Hooks ───────────────────────────────────────────────────────────

// Recalculate averageRating and totalReviews when reviews change
productSchema.pre("save", function (next) {
  if (this.isModified("reviews")) {
    console.log("modified");
    this.totalReviews = this.reviews.length;
    this.averageRating =
      this.reviews.length > 0
        ? Math.round(
            (this.reviews.reduce((sum, review) => sum + review.rating, 0) / // fix: was summing review object not review.rating
              this.reviews.length) *
              10
          ) / 10
        : 0;
  }
  next();
});

// Ensure each user can only review once
productSchema.pre("save", function (next) {
  if (this.isModified("reviews")) {
    const userIds = this.reviews.map((r) => r.user.toString());
    if (new Set(userIds).size !== userIds.length) {
      return next(new Error("Each user can only review a product once"));
    }
  }
  next();
});

// Exclude soft-deleted documents from all find queries
productSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: false });
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

// Soft delete instead of removing from DB
productSchema.methods.softDelete = function () {
  this.isDeleted = true;
  return this.save();
};

// Increment view count
productSchema.methods.incrementView = function () {
  this.viewCount += 1;
  return this.save();
};

// Check if product is in stock
productSchema.methods.isInStock = function () {
  return this.stock > 0 && this.isAvailable;
};

// Get active discount percentage
productSchema.methods.discountPercentage = function () {
  if (!this.discountedPrice) return 0;
  return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
};

// ─── Static Methods ───────────────────────────────────────────────────────────

// Get featured products
productSchema.statics.getFeatured = function (limit = 10) {
  return this.find({ isFeatured: true }).limit(limit);
};

// Get deals
productSchema.statics.getDeals = function (limit = 10) {
  return this.find({ isDeal: true }).limit(limit);
};

// Get products by category
productSchema.statics.getByCategory = function (categoryId, limit = 20) {
  return this.find({ category: categoryId }).limit(limit);
};

// Get top rated
productSchema.statics.getTopRated = function (limit = 10) {
  return this.find({ totalReviews: { $gte: 5 } }) // at least 5 reviews to qualify
    .sort({ averageRating: -1 })
    .limit(limit);
};

// ─── Model ────────────────────────────────────────────────────────────────────
const productModel = mongoose.model("Products", productSchema);

export default productModel;
