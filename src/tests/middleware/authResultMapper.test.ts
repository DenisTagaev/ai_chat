import { ChatSelect } from "../../db/schemas";
import { AuthResultMapper } from "../../middleware/authResultMapper";
import { StreamUser } from "../../utils/interfaces";
import { AuthResult } from "../../utils/types";

describe("AuthResultMapper", () => {
  let res: any;
  const mockUser: StreamUser = {
    id: "1",
    name: "test",
    email: "test@mail.com",
  };
  const mockChatHistory: ChatSelect[] = [
      { message: "Hi", reply: "Hello"}
  ];

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // -----------------------------
  // validation_error
  // -----------------------------
  it("should return 400 if data validation fails", () => {
    const result: AuthResult = {
      type: "validation_error",
      error: "Invalid email",
    };

    AuthResultMapper.toHttpResponse(result, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid email",
    });
  });

  // -----------------------------
  // cooldown
  // -----------------------------
  it("should return 429 if there are too many attempts", () => {
    const result: AuthResult = {
      type: "cooldown",
    };

    AuthResultMapper.toHttpResponse(result, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      error: "Please wait before trying again.",
    });
  });

  // -----------------------------
  // already_registered
  // -----------------------------
  it("should return 409 if user is only partially registered", () => {
    const result: AuthResult = {
      type: "already_registered",
    };

    AuthResultMapper.toHttpResponse(result, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "User already registered.",
    });
  });

  // -----------------------------
  // login
  // -----------------------------
  it("should return 200 if user is logged in", () => {
    const result: AuthResult = {
      type: "login",
      user: mockUser,
      chatHistory: mockChatHistory,
    };

    AuthResultMapper.toHttpResponse(result, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User login success.",
      user: result.user,
      chatHistory: result.chatHistory,
    });
  });

  // -----------------------------
  // registered
  // -----------------------------
  it("should return 201 is user successfully registered", () => {
    const result: AuthResult = {
      type: "registered",
      user: mockUser,
    };

    AuthResultMapper.toHttpResponse(result, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully.",
      user: result.user,
    });
  });

  // -----------------------------
  // default
  // -----------------------------
  it("should handle unknown result safely", () => {
    const result: AuthResult = {
      type: "validation_error",
      error: "Internal auth error",
    };

    AuthResultMapper.toHttpResponse(result, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
