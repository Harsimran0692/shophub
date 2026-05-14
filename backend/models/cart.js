import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required for cart"],
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
        required: [true, "Product is required for cart item"],
      },
      quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [1, "Quantity must be at least 1"],
        default: 1,
      },
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, "Total price cannot be negative"],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
cartSchema.index({ user: 1 }); // Fast user-based lookups
cartSchema.index({ isDeleted: 1 }); // For soft deletion
cartSchema.index({ createdAt: 1 }); // For sorting

// Update totalPrice and updatedAt before saving
cartSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  // Populate products to get prices and availability
  await this.populate({
    path: "items.product",
    select: "price discountedPrice isAvailable stock",
  });

  // Validate product availability and stock
  for (const item of this.items) {
    if (!item.product.isAvailable) {
      throw new Error(`Product ${item.product._id} is not available`);
    }
    if (item.quantity > item.product.stock) {
      throw new Error(`Insufficient stock for product ${item.product._id}`);
    }
  }

  // Calculate total price
  this.totalPrice = this.items.reduce((total, item) => {
    const price = item.product.discountedPrice || item.product.price;
    return total + price * item.quantity;
  }, 0);

  next();
});

// Ensure unique product per cart
cartSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    const productIds = this.items.map((item) => item.product.toString());
    if (new Set(productIds).size !== productIds.length) {
      throw new Error("Each product can only appear once in the cart");
    }
  }
  next();
});

// Exclude deleted documents by default
cartSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: false });
  next();
});

// Static method for bulk updates
cartSchema.statics.updateCartItems = async function (userId, items) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await this.findOne({ user: userId }).session(session);
    if (!cart) throw new Error("Cart not found");

    cart.items = items;
    await cart.save({ session });
    await session.commitTransaction();
    return cart;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const cartModel = mongoose.model("Cart", cartSchema);

export default cartModel;
