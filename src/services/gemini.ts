import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

export async function solveMathProblem(problem: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Solve this math problem and explain the steps clearly: ${problem}`,
    config: {
      systemInstruction: "You are a helpful math expert. Provide clear, step-by-step explanations for math problems. Use LaTeX for formulas where appropriate.",
    },
  });

  return response.text;
}

export async function parseNaturalLanguageMath(query: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert this natural language math query into a simple arithmetic expression that can be evaluated by a calculator: "${query}". Return ONLY the expression, no words.`,
    config: {
      systemInstruction: "You are a math parser. Convert natural language queries like 'what is five plus ten' to '5 + 10'. Only return the expression.",
    },
  });

  return response.text?.trim();
}
