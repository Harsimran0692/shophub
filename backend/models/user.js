import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    googleUserId: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [
        function () {
          return this.authMethod === "manual";
        },
        "Password is required for manual registration",
      ],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Prevent password from being returned in queries
    },
    authMethod: {
      type: String,
      enum: ["manual", "google"],
      default: "manual",
    },
    role: {
      type: String,
      enum: ["customer", "admin", "moderator"],
      default: "customer",
    },
    isVerified: {
      type: Boolean,
      default: function () {
        return this.authMethod === "google" ? true : false;
      },
    },
    resetPasswordOTP: {
      type: String,
      select: false,
    },
    resetPasswordOTPExpires: {
      type: Date,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{10,15}$/, "Invalid phone number"],
      sparse: true, // Allows null/undefined but enforces uniqueness if set
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [100, "Street cannot exceed 100 characters"],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [50, "City cannot exceed 50 characters"],
      },
      state: {
        type: String,
        trim: true,
        maxlength: [50, "State cannot exceed 50 characters"],
      },
      country: {
        type: String,
        trim: true,
        maxlength: [50, "Country cannot exceed 50 characters"],
      },
      postalCode: {
        type: String,
        trim: true,
        maxlength: [20, "Postal code cannot exceed 20 characters"],
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timeStamp: true }
);

// Indexes for performance
userSchema.index({ email: 1 }); // Explicit unique index
userSchema.index({ googleUserId: 1 }, { sparse: true });
userSchema.index({ role: 1 }); // For role-based queries
userSchema.index({ isDeleted: 1 }); // For soft deletion

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password") && this.authMethod === "manual") {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password for authentication
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.authMethod !== "manual") {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate verification OTP
userSchema.methods.generateResetPasswordOTP = async function () {
  if (this.authMethod !== "manual") {
    throw new Error("Password reset not applicable for Google users");
  }
  let otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordOTP = await bcrypt.hash(otp, 10);
  this.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
  await this.save();
  return otp;
};

userSchema.methods.verifyResetPasswordOTP = async function (candidateOTP) {
  if (this.authMethod !== "manual") {
    return false;
  }
  if (!this.resetPasswordOTP || !this.resetPasswordOTPExpires) {
    return false;
  }
  if (Date.now() > this.resetPasswordOTPExpires) {
    return false;
  }

  return bcrypt.compare(candidateOTP, this.resetPasswordOTP);
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
  if (this.authMethod !== "manual") {
    throw new Error("Password reset not applicable for Google users");
  }

  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600 + 1000; // 1 hr
  next();
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
