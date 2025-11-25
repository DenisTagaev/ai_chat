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

  it("should stream Gemini AI response tokens", async () => {
    const mockStreamResponse = async function* () {
      yield "Hello";
      yield " World";
    };

    jest
      .spyOn(geminiAiService, "streamResponse")
      .mockImplementation(
        (): Promise<AsyncGenerator<string>> => Promise.resolve(mockStreamResponse())
      );
    
    const aiStream = await geminiAiService.streamResponse("Hello");
    let result = "";
    for await (const chunk of aiStream) {
      result += chunk;
    }
    expect(result).toBe("Hello World");
  });
});
