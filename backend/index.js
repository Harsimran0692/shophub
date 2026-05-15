import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { categoryRoute } from "./routes/categoryRoutes.js";
import { userRoute } from "./routes/userRoutes.js";
import { productRoute } from "./routes/productRoutes.js";
import { cartRouter } from "./routes/cartRoutes.js";
import { addressRoute } from "./routes/addressRoute.js";
import { reviewRoute } from "./routes/reviewRoute.js";
import { orderRoute } from "./routes/orderRoute.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:4200",
  "https://shophub-weld-tau.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Set COOP header
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.includes("harsimran0692-gmailcoms-projects.vercel.app")
      ) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Testing");
});

// Routes
app.use("/api/categories", categoryRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/order", orderRoute);

app.listen(PORT, () => {
  connectDB(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err);
      process.exit(1);
    });
  console.log(`Listening at port: ${PORT}`);
});
