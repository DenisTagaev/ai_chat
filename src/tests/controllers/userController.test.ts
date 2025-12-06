import request from "supertest";
import app from "../../server";
import { createNeonUser, getNeonUserById } from "../../db/operations";
import * as streamService from "../../services/streamChatService";
import { APIResponse, UserResponse } from "stream-chat";
import generateUserId from "../../utils/idGenerator";
import { normalizeEmail, isEmail } from "validator";
// import { getRedisClient } from "../../services/redisService";

jest.mock("validator");
// jest.mock("@upstash/redis");
jest.mock("../../db/operations");
jest.mock("../../services/streamChatService");

describe("User Controller", () => {
  const testUser = {
    userId: generateUserId("test@example.com"),
    name: "Test User",
    email: "test@example.com",
  };

  // beforeEach(() => {
  //   jest.clearAllMocks();
  //   jest.spyOn(streamService, "checkRegisteredStreamUser").mockResolvedValue({
  //     users: [] as UserResponse[],
  //   } as APIResponse & { users: UserResponse[] });
  //   jest
  //     .spyOn(streamService, "createStreamUser")
  //     .mockResolvedValue(
  //       {} as APIResponse & { users: { [key: string]: UserResponse } }
  //     );
  // });

  afterAll(async() => {
    app.listen().close();
  })

  it("should return 400 for invalid name", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ name: "A", email: "test1@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid name format.");
  });

  it("should return 400 for invalid email address", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ name: "Valid Name", email: "invalid-email" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid email address.");
  });

  it("should return 400 when email sanitization fails", async () => {
    (isEmail as jest.Mock).mockReturnValue(true);
    (normalizeEmail as jest.Mock).mockReturnValue(null);

    const res = await request(app)
      .post("/api/users/register")
      .send({ name: "John Doe", email: "test2@gmail.com" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid email format.");
  });

  it("should return 409 if user already exists in NeonDB", async () => {
    testUser.email = "test3@gmail.com";
    (getNeonUserById as jest.Mock).mockResolvedValue([{ id: testUser.userId }]);
    (streamService.checkRegisteredStreamUser as jest.Mock).mockResolvedValue({ users: [] });
    (isEmail as jest.Mock).mockReturnValue(true);
    (normalizeEmail as jest.Mock).mockReturnValue(testUser.email);
    const res = await request(app).post("/api/users/register").send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("User already registered.");
  });

  it("should return 409 if user already exists in StreamChat", async () => {
    testUser.email="test4@gmail.com";
    (getNeonUserById as jest.Mock).mockResolvedValue([]);
    (streamService.checkRegisteredStreamUser as jest.Mock).mockResolvedValue({
      users: [{ id: testUser.userId }],
    } as APIResponse & { users: UserResponse[] });
    (isEmail as jest.Mock).mockReturnValue(true);
    (normalizeEmail as jest.Mock).mockReturnValue(testUser.email);
    const res = await request(app).post("/api/users/register").send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("User already registered.");
  });


  it("POST /register — should register a user", async () => {
    (createNeonUser as jest.Mock).mockResolvedValue({});
    (streamService.createStreamUser as jest.Mock).mockResolvedValue(testUser);
    (getNeonUserById as jest.Mock).mockResolvedValue([]);
    (isEmail as jest.Mock).mockReturnValue(true);
    (normalizeEmail as jest.Mock).mockReturnValue(testUser.email);

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
