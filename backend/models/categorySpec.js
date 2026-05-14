import mongoose from "mongoose";

const specFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["String", "Number", "Boolean", "Array"],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: { type: [String] },
    min: { type: Number },
    max: { type: Number },
  },
  { _id: false }
);

const categorySpecSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
      unique: true,
    },
    specField: [specFieldSchema],
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("CategorySpec", categorySpecSchema);
