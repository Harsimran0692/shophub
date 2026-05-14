import userModel from "../models/user.js";
import validator from "validator";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import sendMail from "../utils/sendMail.js";
import GenerateJWTToken from "../utils/generateJwtToken.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All mandatory fields are required" });
    }
    const checkEmail = await userModel.findOne({ email });

    if (checkEmail) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Create new user
    const newUser = new userModel({
      name: validator.trim(name),
      email: validator.normalizeEmail(email),
      password,
      phone: phone ? validator.trim(phone) : undefined,
      address: address
        ? {
            street: address.street ? validator.trim(address.street) : undefined,
            city: address.city ? validator.trim(address.city) : undefined,
            state: address.state ? validator.trim(address.state) : undefined,
            country: address.country
              ? validator.trim(address.country)
              : undefined,
            postalCode: address.postalCode
              ? validator.trim(address.postalCode)
              : undefined,
          }
        : undefined,
      verificationToken: crypto.randomBytes(32).toString("hex"),
    });

    await newUser.save();

    const userResponse = {
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt,
    };

    res.status(200).json({
      status: "success",
      data: userResponse,
      msg: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: `Server Error: ${error}` });
  }
};

export const signIn = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and Password is required" });
    }
    const user = await userModel
      .findOne({ email: validator.normalizeEmail(email) })
      .select("+password");

    if (!user) {
      return res.status(400).json({ msg: "Email not registered" });
    }

    let passwordMatch = await user.comparePassword(password);

    if (!passwordMatch) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }

    const token = GenerateJWTToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    // Prepare response data
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      authMethod: user.authMethod,
    };

    res.status(200).json({
      status: "success",
      data: { user: userResponse, token },
      msg: "Signed in successfully",
    });
  } catch (error) {
    res.status(500).json({ msg: `Server Error: ${error}` });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(200).json({
        status: "success",
        message: "If the email is registered, an OTP will be sent",
        data: {
          email: email,
        },
      });
    }

    const otp = await user.generateResetPasswordOTP();

    // OTP via email
    await sendMail(
      email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
      `<p>Your OTP for password reset is: <strong>${otp}</strong>. It is valid for 10 minutes.</p>`
    );

    return res.status(200).json({
      status: "success",
      message: "If the email is registered, an OTP will be sent",
      data: {
        email: email,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    let { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        status: "error",
        message: "Both email and OTP are required",
      });
    }
    const user = await userModel
      .findOne({ email })
      .select(
        "+resetPasswordOTP +resetPasswordOTPExpires +isOtpVerified +otpFailedAttempts"
      );
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "No OTP found for this email",
      });
    }
    let latestGeneratedOtp = user.resetPasswordOTP;

    if (!latestGeneratedOtp) {
      return res.status(400).json({
        status: "error",
        message: "No OTP found for this email",
      });
    }
    const isValidOtp = await user.verifyResetPasswordOTP(otp);
    if (!isValidOtp) {
      return res.status(401).json({
        status: "error",
        message: "Invalid or expired OTP",
      });
    }

    // Clear OTP after verification
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: `Internal server error: ${error.message}`,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const user = await userModel
      .findOne({
        email,
      })
      .select("+password");

    if (!user) {
      // console.log("inn this user find");
      return res.status(401).json({
        status: "error",
        message: "OTP not verified or session expired",
      });
    }

    // Update password
    user.password = password; // Will be hashed by pre-save hook
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    return res.status(200).json({
      status: "success",
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: `Internal server error: ${error.message}`,
    });
  }
};

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists with googleId or email
    let user = await userModel.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // If user exists and was registered with Google, allow login
      if (user.authMethod === "google") {
        // Generate JWT token
        const token = GenerateJWTToken({
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          authMethod: user.authMethod,
        });

        const userResponse = {
          _id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
          role: user.role,
          authMethod: user.authMethod,
        };

        return res.status(200).json({
          status: "success",
          data: { user: userResponse, token },
        });
      } else {
        // User exists with manual account
        return res.status(409).json({
          message:
            "Email already registered with manual account. Please link your Google account or sign in manually.",
          email,
        });
      }
    }

    // If no user exists, create a new one
    user = new userModel({
      name: name,
      googleId: googleId, // Corrected from googleUserId to match query
      email: email,
      profileImage: picture,
      authMethod: "google",
      isVerified: true,
    });
    await user.save();

    // Generate JWT token
    const token = GenerateJWTToken({
      id: user._id,
      email,
      name,
      role: user.role,
      authMethod: user.authMethod,
    });

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.profileImage, // Corrected to match schema
      role: user.role,
      authMethod: user.authMethod,
    };

    res.status(200).json({
      status: "success",
      data: { user: userResponse, token },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(401).json({ error: "Invalid Google token" });
  }
};

export const linkGoogleAccount = async (req, res) => {
  const { idToken, email, password } = req.body;

  try {
    // Validate request body
    if (!idToken || !email || !password) {
      return res
        .status(400)
        .json({ message: "idToken, email, and password are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email: googleEmail, name, picture } = payload;

    // Ensure Google email matches provided email
    if (googleEmail !== email) {
      return res.status(400).json({
        message: "Google account email does not match provided email",
      });
    }

    // Find user by email
    let user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    // Verify password (assuming password is hashed with bcrypt in userModel)
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if Google account is already linked
    if (user.googleUserId) {
      return res
        .status(409)
        .json({ message: "Google account already linked to this user" });
    }

    // Link Google account to existing user
    user.googleUserId = googleId;
    // Keep authMethod as 'manual' or update to support both (e.g., array or separate field)
    user.authMethod = user.authMethod; // Preserve existing authMethod
    user.name = user.name || name;
    user.profileImage = user.profileImage || picture;
    user.isVerified = true;
    await user.save();

    // Generate JWT
    const token = GenerateJWTToken({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      authMethod: user.authMethod,
    });

    // Respond with token and user data
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.profileImage,
        role: user.role,
        authMethod: user.authMethod,
      },
    });
  } catch (error) {
    console.error("Link Google account error:", error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(403).json({ message: "Invalid Google ID token" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
