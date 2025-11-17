import OpenAI from "openai";
import { Stream } from "openai/core/streaming";

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAiChatResponse(message: string): Promise<
  Stream<OpenAI.Chat.Completions.ChatCompletionChunk> & {
    _request_id?: string | null;
  }
> {
  try {
    const result = await openAiClient.chat.completions.create({
      model: "chatgpt-4o-latest",
      stream: true,
      messages: [{ role: "user", content: message }],
    });

    return result;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to get AI response");
  }
}
