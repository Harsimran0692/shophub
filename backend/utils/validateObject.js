/**
 * Validates if a string is a valid MongoDB ObjectId
 * param {string} id - The ID to validate
 * returns {boolean} True if valid, false otherwise
 */

import mongoose from "mongoose";

const validateObject = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export default validateObject;
