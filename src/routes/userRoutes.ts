import { Router } from "express";
import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import { handleAuth } from "../controllers/userController";
import { validate } from "../middleware/zodValidator";
import { AuthUserSchema } from "../db/validators/zodUserChemas";

const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // limit each IP to 5 registration attempts per minute
  message: "Too many registration attempts. Please try again later.",
});

const router: Router = Router();

router.post("/login", validate(AuthUserSchema), authLimiter, handleAuth);

export default router;
