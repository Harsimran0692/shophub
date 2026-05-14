import mongoose from "mongoose";
import addressModel from "../models/address.js";
import orderModel from "../models/order.js";
import productModel from "../models/product.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import validateObject from "../utils/validateObject.js";

export const createOrder = asyncHandler(async (req, res, next) => {
  const { id: userId } = req.user;
  const { items, addressId, paymentMethod } = req.body;

  // 1. Validate addressId
  if (!validateObject(addressId)) {
    return next(new AppError("Invalid address ID", 400));
  }

  // 2. Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    return next(new AppError("Order must have at least one item", 400));
  }

  // 3. Validate paymentMethod
  const allowedPaymentMethods = ["card", "cash_on_delivery", "wallet"];
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    return next(
      new AppError(
        `Payment method must be one of: ${allowedPaymentMethods.join(", ")}`,
        400
      )
    );
  }

  // 4. Verify address belongs to user
  const address = await addressModel
    .findOne({ _id: addressId, user: userId })
    .select("streetAddress postalCode region country");
  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  //   console.log(items);

  // 5. Extract product IDs from request and validate them
  const productIds = items.map((item) => {
    // console.log(item.product);
    if (!validateObject(item.product)) {
      throw new AppError(`Invalid product ID: ${item.product}`, 400);
    }
    return item.product;
  });

  // 6. Fetch all products in one query
  const products = await productModel.find({ _id: { $in: productIds } });

  // 7. Check all products actually exist
  if (products.length !== productIds.length) {
    return next(new AppError("One or more products not found", 404));
  }

  // 8. Build order items with price snapshot + calculate total
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  let totalAmount = 0;

  const orderItems = items.map((item) => {
    const product = productMap.get(item.product.toString());

    // validate quantity
    if (!item.quantity || item.quantity < 1) {
      throw new AppError(`Invalid quantity for product: ${product.name}`, 400);
    }

    // check stock
    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for product: ${product.name}`,
        400
      );
    }

    totalAmount += item.price;

    return {
      product: product._id,
      name: product.name, // snapshot
      price: product.price, // snapshot
      quantity: item.quantity,
    };
  });

  // 9. Create order + deduct stock — both must succeed together
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // deduct stock for each product
    for (const item of items) {
      await productModel.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { session }
      );
    }

    // create the order
    const order = await orderModel.create(
      [
        {
          user: userId,
          items: orderItems,
          address: addressId,
          status: "pending",
          paymentMethod,
          paymentStatus: "unpaid",
          totalAmount: parseFloat((totalAmount * 1.08).toFixed(2)),
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      status: "success",
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

export const getOrders = asyncHandler(async (req, res, next) => {
  const { id: userId } = req.user;

  if (!validateObject(userId)) {
    return next(new AppError("Invalid user ID", 400));
  }

  const orders = await orderModel
    .find({ user: userId })
    .populate("address", "streetAddress postalCode region country")
    .populate("items.product", "name price images");

  res.status(200).json({
    status: "success",
    data: orders,
  });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id: userId } = req.user;
  const { id: orderId } = req.body;

  if (!validateObject(userId)) {
    return next(new AppError("Invalid user ID", 400));
  }
  if (!validateObject(orderId)) {
    return next(new AppError("Invalid order ID", 400));
  }

  const product = await orderModel.findOneAndUpdate(
    {
      user: userId,
      _id: orderId,
    },
    { $set: { status: "cancelled" } },
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new AppError("Product not Found", 404));
  }
  res.status(200).json({
    status: "success",
  });
});
