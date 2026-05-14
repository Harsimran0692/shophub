import productModel from "../models/product.js";
import validateObject from "./validateObject.js";

const validateProductId = async (id) => {
  if (!validateObject(id)) {
    throw new Error("Invalid product id");
  }

  let product = await productModel.findOne({
    _id: id,
  });

  return !!product;
};

export default validateProductId;
