import mongoose from "mongoose";

const addressSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    streetAddress: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: function () {
        return ["US", "CA"].includes(this.country);
      },
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // Use ISO 3166-1 alpha-2 codes (e.g., "US", "CA")
      match: [/^[A-Z]{2}$/, "Invalid country code"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\+?\d{10,15}$/, "Invalid phone number format"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    addressType: {
      type: String,
      enum: ["billing", "shipping"],
      default: "shipping",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

addressSchema.pre("save", async function (next) {
  if (this.isNew) {
    const addressCount = await mongoose
      .model("addresses")
      .countDocuments({ user: this.user });
    if (addressCount >= 5) {
      return next(
        new Error("Cannot add more addresses. Maximum limit of 5 reached.")
      );
    }
  }
  next();
});

addressSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const filter = this.getFilter();

  if (update?.$set?.isDefault !== true) return next();

  await this.model.updateMany(
    {
      user: filter.user,
      _id: { $ne: filter._id },
    },
    { $set: { isDefault: false } }
  );

  next();
});

addressSchema.index({ user: 1 });

addressSchema.index(
  { user: 1, addressType: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

const addressModel = mongoose.model("addresses", addressSchema);

export default addressModel;
