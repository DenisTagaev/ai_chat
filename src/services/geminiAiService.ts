import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { GeminiMessage } from "../utils/interfaces";

export interface GeminiFormattedText {
    role: "user" | "model";
    parts: {
        text: string;
    }[];
}
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
      throw new Error("User message is empty");
    }

    const contents: GeminiFormattedText[] = [
      ...this.formatChatHistory(history),
      {
        role: "user" as const,
        parts: [{ text: userMessage }],
      },
    ];

    const response: GenerateContentResponse = await this.geminiAiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    // Safe extraction
    const text: string =
      response?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("") ?? "";

    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    return text;
  }

  public _getClient(): GoogleGenAI {
    return this.geminiAiClient;
  }
}

export const geminiAiService = new GeminiAiClient();