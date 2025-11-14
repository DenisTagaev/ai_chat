import OpenAI from "openai";

const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAiChatResponse(message: string): Promise<string> {
  try {
    const result = await openAiClient.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [{ role: "user", content: message }],
    });

    return result.choices[0].message?.content ?? "No response, try again later";
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to get AI response");
  }
}
