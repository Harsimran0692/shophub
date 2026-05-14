/**
 * Sanitizes input to prevent injection attacks and ensure clean data
 * {string|Object} input - Input to sanitize (string or query object)
 * {string|Object} Sanitized input
 */

const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input.replace("/[<>{}]/g", "").replace("/s+/g", " ").trim();
  }
  if (typeof input === "object" && input !== null) {
    const sanatized = {};
    for (let [key, value] of Object.entries(input)) {
      if (typeof value === "string") {
        sanatized[key] = sanitizeInput(value);
      } else {
        sanatized[key] = value;
      }
    }
    return sanatized;
  }
  return input;
};

export default sanitizeInput;
