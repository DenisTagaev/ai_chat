import { ChatResultMapper } from "../../middleware/chatResultMapper";
import { ChatResponse } from "../../utils/types";

describe("ChatResultMapper", () => {
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // -----------------------------
  // validation_error
  // -----------------------------
  it("should return 400 if validation fails", () => {
    const result: ChatResponse = {
      type: "validation_error",
    };

    ChatResultMapper.toHttp(res, result);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing required fields",
    });
  });

  // -----------------------------
  // user_not_found
  // -----------------------------
  it("should return 404 if user does not exist in the database", () => {
    const result: ChatResponse = {
      type: "user_not_found",
    };

    ChatResultMapper.toHttp(res, result);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });

  // -----------------------------
  // success
  // -----------------------------
  it("should return 200 for successful reply", () => {
    const result: ChatResponse = {
      type: "success",
      reply: "Hello there!",
    };

    ChatResultMapper.toHttp(res, result);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      reply: "Hello there!",
    });
  });

  // -----------------------------
  // default
  // -----------------------------
  it("should handle unknown type safely", () => {
    const result = { type: "unknown" } as any;

    ChatResultMapper.toHttp(res, result);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
