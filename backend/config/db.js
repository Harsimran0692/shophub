import mongoose from "mongoose";

export const connectDB = async (connectionString) => {
  try {
    await mongoose.connect(connectionString);
  } catch (error) {
    console.error(`Failed to connect to database. ${error.message}`);
  }
};
