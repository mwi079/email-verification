import rateLimit from "express-rate-limit";

const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
});

export default uploadLimiter;
