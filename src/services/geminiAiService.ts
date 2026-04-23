import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { GeminiFormattedText, GeminiMessage } from "../utils/interfaces";
import { logger } from "../utils/logger";
import { TimeoutError, withTimeout } from "../utils/timeout";

export class GeminiAiClient {
  private readonly geminiAiClient: GoogleGenAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined");
    }

    this.geminiAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  private formatChatHistory(history: GeminiMessage[]): GeminiFormattedText[] {
    return history.map((h) => ({
      role: h.role,
      parts: [{ text: h.content }],
    }));
  }

  async generateResponse(
    userMessage: string,
    history: GeminiMessage[] = [],
  ): Promise<string> {
    if (!userMessage?.trim()) {
      logger.warn("gemini.validation.empty_message");
      throw new Error("User message is empty");
    }

    const contents: GeminiFormattedText[] = [
      ...this.formatChatHistory(history),
      {
        role: "user" as const,
        parts: [{ text: userMessage }],
      },
    ];

    try {
      const response: GenerateContentResponse = await 
      withTimeout(
        this.geminiAiClient.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
        }),
        10000,
        "Gemini API call"
      );

      // Safe extraction
      const text: string =
        response?.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("") ?? "";

      if (!text) {
        logger.error("gemini.response.empty");
        throw new Error("Empty response from Gemini");
      }

      return text;
    } catch (err) {
      if (err instanceof TimeoutError) {
        logger.warn({ userMessage }, "gemini.api.timeout");
      } else {
        logger.error({ err }, "gemini.api.call_failed");
      }
      throw err;
    }

  }

  public _getClient(): GoogleGenAI {
    return this.geminiAiClient;
  }
}

export const geminiAiService = new GeminiAiClient();