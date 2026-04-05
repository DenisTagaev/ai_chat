import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AuthResultMapper } from "../middleware/authResultMapper";
import { AuthResult } from "../utils/types";
import { logger } from "../utils/logger";

export async function handleAuth(req: Request, res: Response): Promise<any> {
  const { name, email } = req.body;

  try {
    const authResult: AuthResult = await AuthService.authenticateOrRegister(
      name,
      email,
    );

    return AuthResultMapper.toHttpResponse(authResult, res);
  } catch (err: any) {
    logger.error({ name, email, err },"Registration Error:");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}