import cartModel from "../models/cart.js";

export const createOrUpdateCart = async (req, res) => {
  try {
    let { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res
        .status(400)
        .json({ msg: "Product Id and valid quantity is required" });
    }

    let cart = await cartModel.findOne({ user: req.user.id });

    if (!cart) {
      cart = new cartModel({
        user: req.user.id,
        items: [],
      });
    }

    let itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity: quantity });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name price discountedPrice images category isAvailable stock",
      populate: {
        path: "category",
        select: "name",
      },
    });

    res.status(200).json({
      status: "success",
      data: cart,
      message: "Product added to cart successfully",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get cart by user ID
export const getCart = async (req, res) => {
  try {
    // console.log(req.user.id);
    const cart = await cartModel.findOne({ user: req.user.id }).populate({
      path: "items.product",
      select: "name price discountedPrice images category isAvailable stock",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "cart not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { cartId, quantity } = req.body;

    const cart = await cartModel.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === cartId
    );
    if (itemIndex === -1) {
      cart.items.push({ product: cartId, quantity });
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    // console.log(cart);

    await cart.populate({
      path: "items.product",
      select: "name price discountedPrice images category isAvailable stock",
      populate: {
        path: "category",
        select: "name",
      },
    });

    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete cart item
export const deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await cartModel.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "cartModel not found",
      });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== productId);

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name price discountedPrice images",
    });

    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "cartModel not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: "success",
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
