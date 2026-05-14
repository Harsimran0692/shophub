import rateLimit from "express-rate-limit";

export const signinLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many registration attempts, please try again later.",
});
