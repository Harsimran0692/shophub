import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  image: {
    type: String,
    default:
      "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png?v=1530129081",
    validate: {
      validator: (v) => /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v),
      message: "Invalid category image URL",
    },
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
categorySchema.index({ name: "text" }); // for text search
categorySchema.index({ createdAt: 1 }); // for sorting
categorySchema.index({ isDeleted: 1 }); // for filtering

// update the updatedAt on save
categorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Exclude deleted document by default
categorySchema.pre(/^find/, function (next) {
  this.find({ isDeleted: false });
  next();
});
const categoryModel = mongoose.model("Categories", categorySchema);

export default categoryModel;
