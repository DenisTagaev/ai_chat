import { Chat, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { GeminiMessage } from "../utils/interfaces";

export type GeminiStream<T> = AsyncGenerator<T, any, any>;
export class geminiAiClient {
  private geminiAiClient: GoogleGenAI;

  constructor() {
    this.geminiAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  private createChat(history: GeminiMessage[]): Chat {
    const formattedHistory: {
      role: "user" | "model";
      parts: {
        text: string;
      }[];
    }[] = history.map((h: GeminiMessage) => ({
      role: h.role,
      parts: [{ text: h.content }],
    }));

    return this.geminiAiClient.chats.create({
      model: "gemini-2.5-flash",
      history: formattedHistory,
    });
  }

  async streamResponse(
    userMessage: string,
    history: GeminiMessage[] = []
  ): Promise<AsyncGenerator<string>> {
    const chat: Chat = this.createChat(history);

    const stream: GeminiStream<GenerateContentResponse> =
      await chat.sendMessageStream({
        message: userMessage,
      });

    return this.readStream(stream);
  }

  private async *readStream(
    stream: GeminiStream<GenerateContentResponse>
  ): AsyncGenerator<string> {
    for await (const chunk of stream) {
      if (chunk?.text) {
        yield chunk.text;
      }
    }
  }

  public _getClient(): GoogleGenAI {
    return this.geminiAiClient;
  }
}

export const geminiAiService = new geminiAiClient();