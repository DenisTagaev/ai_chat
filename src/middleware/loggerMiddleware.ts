import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function attachLogger(req: Request, _res: Response, next: NextFunction) {
  req.log = logger;
  next();
}