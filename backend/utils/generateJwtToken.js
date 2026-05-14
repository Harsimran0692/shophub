import jwt from "jsonwebtoken";

const GenerateJWTToken = (payload, expiry = "1h") => {
  if (!payload && typeof payload !== "object") {
    throw new Error("Payload must be a non-empty object");
  }
  if (!payload.id) {
    throw new Error("Payload must include id");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret key not found");
  }
  if (typeof expiry !== "string" && typeof expiry !== "number") {
    throw new Error("Expiry must be a string (e.g., '1h') or number (seconds)");
  }

  try {
    let token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expiry,
    });
    return token;
  } catch (error) {
    throw new Error(`Failed to generate JWT: ${error.message}`);
  }
};

export default GenerateJWTToken;
