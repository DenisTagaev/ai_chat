import { GeminiAiClient } from "../../services/geminiAiService";
import { GoogleGenAI } from "@google/genai";
import { GeminiMessage } from "../../utils/interfaces";

jest.mock("@google/genai");

describe("geminiAiClient", () => {
  let mockGeneratedContent: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = "test-key";
    mockGeneratedContent = jest.fn();

    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      models: {
        generateContent: mockGeneratedContent,
      },
    }));
  });

  // -----------------------------
  // constructor
  // -----------------------------
  it("should throw an exception if API key is missing", () => {
    delete process.env.GEMINI_API_KEY;

    expect(() => new GeminiAiClient()).toThrow("GEMINI_API_KEY is not defined");
  });

  it("should initialize new client with API key from the .env", () => {
    const client: GeminiAiClient = new GeminiAiClient();

    expect(GoogleGenAI).toHaveBeenCalledWith({
      apiKey: "test-key",
    });

    expect(client._getClient()).toBeDefined();
  });

  // -----------------------------
  // generateResponse
  // -----------------------------
  it("should throw an exception if userMessage is empty", async () => {
    const client: GeminiAiClient = new GeminiAiClient();

    await expect(client.generateResponse("")).rejects.toThrow(
      "User message is empty",
    );
  });

  it("should call Gemini API with formatted history and return response", async () => {
    const client: GeminiAiClient = new GeminiAiClient();

    mockGeneratedContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [{ text: "Hello" }, { text: " World" }],
          },
        },
      ],
    });

    const history: GeminiMessage[] = [
      { role: "user", content: "Hi" },
      { role: "model", content: "Hello" },
    ];

    const result: string = await client.generateResponse("How are you?", history);

    expect(mockGeneratedContent).toHaveBeenCalledWith({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: "Hi" }] },
        { role: "model", parts: [{ text: "Hello" }] },
        { role: "user", parts: [{ text: "How are you?" }] },
      ],
    });

    expect(result).toBe("Hello World");
  });

  it("should throw an error if Gemini call returns empty response", async () => {
    const client: GeminiAiClient = new GeminiAiClient();

    mockGeneratedContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [{ text: "" }],
          },
        },
      ],
    });

    await expect(client.generateResponse("Hello")).rejects.toThrow(
      "Empty response from Gemini",
    );
  });

  it("should handle parts with missing text using fallback", async () => {
    const client: GeminiAiClient = new GeminiAiClient();

    mockGeneratedContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              { text: "Hello" },
              {},
              { text: " World" },
            ],
          },
        },
      ],
    });

    const result: string = await client.generateResponse("Hi");

    expect(result).toBe("Hello World");
  });

  it("should throw an error if response structure is invalid", async () => {
    const client: GeminiAiClient = new GeminiAiClient();

    mockGeneratedContent.mockResolvedValue({});

    await expect(client.generateResponse("Hello")).rejects.toThrow(
      "Empty response from Gemini",
    );
  });
});
