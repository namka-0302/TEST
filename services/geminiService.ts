
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const parseQuestionBatch = async (textChunk: string, batchIndex: number) => {
  if (!API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    You are an expert educational content parser. 
    Task: Extract multiple-choice questions from the provided text extracted from a PDF (Batch ${batchIndex}).
    
    Rules:
    1. Identify questions starting with "Câu X:" or "Question X:".
    2. Identify choices starting with A., B., C., or D.
    3. Determine the correct answer. In PDF text, this is often marked by an asterisk (*), a checkmark, a different prefix, or explicitly mentioned in the text.
    4. Extract "Explanation" or "Giải thích" if present.
    5. Assign difficulty: 'Easy', 'Medium', or 'Hard'.
    
    Output: A clean JSON array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract questions from this text Batch:\n\n${textChunk}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
              explanation: { type: Type.STRING },
              choices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    text: { type: Type.STRING },
                    isCorrect: { type: Type.BOOLEAN }
                  },
                  required: ["label", "text", "isCorrect"]
                }
              }
            },
            required: ["text", "choices", "difficulty"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      choices: q.choices.map((c: any) => ({
        ...c,
        id: Math.random().toString(36).substr(2, 9)
      }))
    }));
  } catch (error) {
    console.error(`Error in Batch ${batchIndex}:`, error);
    throw error;
  }
};
