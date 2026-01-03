import { Router } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { loginUser, registerUser } from "../controllers/userController";
import { validate } from "../middleware/zodValidator";
import { RegisterUserSchema } from "../db/validators/zodUserChemas";

const registerLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // limit each IP to 5 registration attempts per minute
  message: "Too many registration attempts. Please try again later.",
});

const router: Router = Router();

router.post("/register", validate(RegisterUserSchema), registerLimiter, registerUser);
router.post("/login", loginUser);

export default router;
