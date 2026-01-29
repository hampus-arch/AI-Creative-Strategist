import OpenAI from "openai";

export function createOpenAIClient(apiKey: string) {
  return new OpenAI({
    apiKey,
  });
}

export async function getAvailableModels(apiKey: string) {
  try {
    const openai = createOpenAIClient(apiKey);
    const models = await openai.models.list();
    
    // Filter to only include chat models
    const chatModels = models.data
      .filter((model) => 
        model.id.includes("gpt") || 
        model.id.includes("o1") ||
        model.id.includes("o3")
      )
      .map((model) => model.id)
      .sort();
    
    return chatModels;
  } catch (error) {
    console.error("Error fetching models:", error);
    throw error;
  }
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const openai = createOpenAIClient(apiKey);
    await openai.models.list();
    return true;
  } catch {
    return false;
  }
}

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function* streamChatCompletion(
  apiKey: string,
  model: string,
  messages: Message[]
) {
  const openai = createOpenAIClient(apiKey);
  
  const stream = await openai.chat.completions.create({
    model,
    messages,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      yield content;
    }
  }
}
