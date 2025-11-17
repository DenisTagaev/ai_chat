import { ZodMiniObject } from "zod/v4-mini";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodMiniObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error: any) {
      return res.status(400).json({
        error: "Invalid request data",
        details: error.errors,
      });
    }
  };
