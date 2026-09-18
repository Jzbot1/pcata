// Custom lightweight NoSQL injection sanitizer without heavy external dependencies
const hasSpecialChars = (key) => key.startsWith("$") || key.includes(".");

const sanitize = (obj) => {
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) {
      obj.forEach((item) => sanitize(item));
    } else {
      Object.keys(obj).forEach((key) => {
        if (hasSpecialChars(key)) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      });
    }
  }
  return obj;
};

const mongoSanitizer = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};

module.exports = mongoSanitizer;
