import request from "supertest";
import app from "../../server";
import { AuthService } from "../../services/authService";
import { AuthResultMapper } from "../../middleware/authResultMapper";

jest.mock("../../services/authService");
jest.mock("../../middleware/authResultMapper");

describe("User Controller", () => {
  const validBody = {
    name: "Denis",
    email: "denis@test.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------
  // POST /api/users/auth (adjust if route differs)
  // -----------------------------
  describe("POST /api/users/auth", () => {
    it("should call AuthService and call mapper for response", async () => {
      const mockAuthResult = {
        type: "fully_registered",
        user: { id: "123", name: "Denis" },
        chatHistory: [{ message: "Hi", reply: "Hello" }],
      };

      (AuthService.authenticateOrRegister as jest.Mock).mockResolvedValue(
        mockAuthResult,
      );

      (AuthResultMapper.toHttpResponse as jest.Mock).mockImplementation(
        (data, res) => res.status(200).json(data),
      );

      const res = await request(app).post("/api/users/auth").send(validBody);

      expect(AuthService.authenticateOrRegister).toHaveBeenCalledWith(
        validBody.name,
        validBody.email,
      );

      expect(AuthResultMapper.toHttpResponse).toHaveBeenCalledWith(
        mockAuthResult,
        expect.any(Object),
      );

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockAuthResult);
    });

    it("should handle service error and return 500", async () => {
      (AuthService.authenticateOrRegister as jest.Mock).mockRejectedValue(
        new Error("Auth failure"),
      );

      const res = await request(app).post("/api/users/auth").send(validBody);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal Server Error" });
    });

    it("should pass undefined values if fields are missing", async () => {
      (AuthService.authenticateOrRegister as jest.Mock).mockResolvedValue({});

      (AuthResultMapper.toHttpResponse as jest.Mock).mockImplementation(
        (_data, res) => res.status(200).json({}),
      );

      await request(app).post("/api/users/auth").send({});

      expect(AuthService.authenticateOrRegister).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });
});
