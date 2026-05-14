import mongoose, { mongo } from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: [true, "Product is required"],
  },
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for order"],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "addresses",
      required: [true, "Address is required for order"],
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
