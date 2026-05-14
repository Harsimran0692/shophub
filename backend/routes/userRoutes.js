import express from "express";
import {
  resetPassword,
  verifyOtp,
  forgotPassword,
  registerUser,
  signIn,
  googleLogin,
  linkGoogleAccount,
} from "../controller/userController.js";
import { registrationLimiter } from "../middlewares/registrationLimiter.js";
import { signinLimiter } from "../middlewares/signinLimiter.js";
import apiHitLimiter from "../middlewares/apiHitLimiter.js";

export const userRoute = express.Router();

userRoute.post("/register", registrationLimiter, registerUser);
userRoute.post("/login", signinLimiter, signIn);
userRoute.post("/forgot-password", apiHitLimiter, forgotPassword);
userRoute.post("/verify-otp", verifyOtp);
userRoute.put("/reset-password", resetPassword);
userRoute.post("/auth/google", googleLogin);
userRoute.post("/auth/link-google", linkGoogleAccount);
