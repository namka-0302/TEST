
import { GoogleGenAI, Type } from "@google/genai";

export const parseQuestionBatch = async (textChunk: string, batchIndex: number) => {
  // Use GoogleGenAI with process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    Bạn là một chuyên gia phân tích nội dung giáo dục.
    Nhiệm vụ: Trích xuất các câu hỏi trắc nghiệm từ văn bản PDF được cung cấp (Batch ${batchIndex}).
    
    Quy tắc:
    1. Nhận diện câu hỏi bắt đầu bằng "Câu X:" hoặc con số.
    2. Nhận diện các lựa chọn A, B, C, D.
    3. Xác định đáp án đúng dựa trên các ký hiệu (như * hoặc in đậm) hoặc ngữ cảnh.
    4. Trích xuất "Giải thích" nếu có.
    5. Gán độ khó: 'Easy', 'Medium', hoặc 'Hard'.
    
    Đầu ra: Trả về một mảng JSON các đối tượng câu hỏi.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Trích xuất câu hỏi từ đoạn văn bản này:\n\n${textChunk}`,
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

    // response.text is a property, not a method.
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
    console.error(`Lỗi tại Batch ${batchIndex}:`, error);
    throw error;
  }
};