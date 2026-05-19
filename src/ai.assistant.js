JavaScript
import ModelClient from "@azure/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// Grabs your secure token when the app executes live
const token = process.env.GITHUB_MODELS_TOKEN;
const client = new ModelClient(
  "https://models.inference.ai.azure.com", 
  new AzureKeyCredential(token)
);

export async function askYourModel(userTask) {
  try {
    const response = await client.path("/chat/completions").post({
      body: {
        model: "gpt-4.1-mini", 
        messages: [
          {
            role: "system",
            content: "Role: Expert Senior Engineer & UI/UX Developer. Task: Provide clean, production-ready code. UX: Mobile-first, semantic HTML. Format: Code first. Max 1-2 sentences explanation. No conversational fluff."
          },
          {
            role: "user",
            content: userTask
          }
        ],
        temperature: 0.1,
        max_tokens: 2500,
        top_p: 0.1
      }
    });

    if (response.status !== "200") {
      throw new Error(`Model Error: ${response.body.error}`);
    }

    return response.body.choices[0].message.content;
  } catch (error) {
    console.error("Failed to fetch from GitHub Models:", error);
    return "Error communicating with the code assistant.";
  }
}