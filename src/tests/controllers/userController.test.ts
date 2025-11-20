import request from "supertest";
import app from "../../server";
import { createNeonUser, getNeonUserById } from "../../db/operations";
import * as streamService from "../../services/streamChatService";

jest.mock("../../db/operations");
jest.mock("../../services/streamChatService");

describe("User Controller", () => {
  const testUser = {
    userId: "test-user-123",
    name: "Test User",
    email: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("POST /register — should register a user", async () => {
    (createNeonUser as jest.Mock).mockResolvedValue({});
    (streamService.createStreamUser as jest.Mock).mockResolvedValue(testUser);
    (getNeonUserById as jest.Mock).mockResolvedValue([]);

    const res = await request(app).post("/register").send(testUser).expect(201);

    expect(createNeonUser).toHaveBeenCalled();
    expect(streamService.createStreamUser).toHaveBeenCalled();
    expect(res.body.userId).toBe(testUser.userId);
  });

  it("POST /register — should reject missing fields", async () => {
    const res = await request(app).post("/register").send({}).expect(400);

    expect(res.body.error).toBeDefined();
  });

  it("POST /register — should block duplicate users", async () => {
    (getNeonUserById as jest.Mock).mockResolvedValue([testUser]);

    const res = await request(app).post("/register").send(testUser).expect(409);

    expect(res.body.error).toBeDefined();
  });
});
