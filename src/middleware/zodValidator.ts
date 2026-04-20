import { ZodMiniObject } from "zod/v4-mini";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodMiniObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: result.error,
      });
    }

    next();
  };
