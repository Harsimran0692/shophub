import rateLimit from "express-rate-limit";

const apiHitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: `Too many requests please try after 1 min`,
});

export default apiHitLimiter;
