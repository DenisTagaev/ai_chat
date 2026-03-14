import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { AuthResultMapper } from "../middleware/authResultMapper";
import { AuthResult } from "../utils/types";

export async function handleAuth(req: Request, res: Response): Promise<any> {
  const { name, email } = req.body;

  try {
    const authResult: AuthResult = await AuthService.authenticateOrRegister(
      name,
      email,
    );

    return AuthResultMapper.toHttpResponse(authResult, res);
  } catch (error: any) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}