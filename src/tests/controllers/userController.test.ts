import request from "supertest";
import app from "../../server";
import { createNeonUser, getNeonUserById } from "../../db/operations";
import * as streamService from "../../services/streamChatService";
import { APIResponse, UserResponse } from "stream-chat";
import generateUserId from "../../utils/idGenerator";

jest.mock("../../db/operations");
jest.mock("../../services/streamChatService");

describe("User Controller", () => {
  const testUser = {
    userId: generateUserId("test@example.com"),
    name: "Test User",
    email: "test@example.com",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(streamService, "checkRegisteredStreamUser").mockResolvedValue({
      users: [] as UserResponse[],
    } as APIResponse & { users: UserResponse[] });
    jest
      .spyOn(streamService, "createStreamUser")
      .mockResolvedValue(
        {} as APIResponse & { users: { [key: string]: UserResponse } }
      );
  });

  afterAll(async() => {
    app.listen().close();
  })

  it("POST /register — should register a user", async () => {
    (createNeonUser as jest.Mock).mockResolvedValue({});
    (streamService.createStreamUser as jest.Mock).mockResolvedValue(testUser);
    (getNeonUserById as jest.Mock).mockResolvedValue([]);

    const res = await request(app)
      .post("/api/users/register")
      .send(testUser)
      .expect(201);

    expect(createNeonUser).toHaveBeenCalledWith(
      generateUserId(testUser.email),
      testUser.name,
      testUser.email
    );
    expect(streamService.createStreamUser).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: testUser.name,
        email: testUser.email,
        role: "user",
      })
    );
    expect(res.body.user.id).toBe(generateUserId(testUser.email));
    expect(res.body.message).toBe("User registered successfully.");
  });

  it("POST /register — should reject invalid fields", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({})
      .expect(400);

    expect(res.body.error).toBeDefined();
  });
});
