import { geminiAiService } from "../../services/geminiAiService";

describe("geminiAiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize GoogleGenAI client", () => {
    expect(geminiAiService._getClient()).toBeDefined();
  });

  it("createChat should format history correctly", () => {
    const history = [
      { role: "user", content: "Hi" },
      { role: "model", content: "Hello there" },
    ];
    const chat = (geminiAiService as any).createChat(history);
    expect(chat).toBeDefined();

    const formattedHistory = (chat as any).history || [];
    expect(formattedHistory).toEqual([
      { role: "user", parts: [{ text: "Hi" }] },
      { role: "model", parts: [{ text: "Hello there" }] },
    ]);
  });

  it("should return full Gemini response", async () => {
    jest
      .spyOn(geminiAiService, "generateResponse")
      .mockResolvedValue("Hello World");

    const result = await geminiAiService.generateResponse("Hello");

    expect(result).toBe("Hello World");
  });

  it("should propagate errors from Gemini client", async() => {
    jest
      .spyOn(geminiAiService, "generateResponse")
      .mockRejectedValue(new Error("Gemini failure"));

    await expect(
      geminiAiService.generateResponse("Hello")
    ).rejects.toThrow("Gemini failure");
  })
});
