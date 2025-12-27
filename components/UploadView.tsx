
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { parseQuestionBatch } from '../services/geminiService';
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

interface UploadViewProps {
  onAddQuestions: (questions: Question[]) => void;
  questions: Question[]; // Thêm prop để đối soát
}

const UploadView: React.FC<UploadViewProps> = ({ onAddQuestions, questions }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'ai-gen'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const navigate = useNavigate();

  // Kiểm tra câu trùng lặp
  const checkIsDuplicate = (text: string) => {
    const normalizedText = text.trim().toLowerCase().replace(/\s+/g, ' ');
    return questions.some(q => 
      q.text.trim().toLowerCase().replace(/\s+/g, ' ') === normalizedText
    );
  };

  // Tính toán số lượng câu trùng
  const duplicateCount = useMemo(() => {
    return previewQuestions.filter(q => checkIsDuplicate(q.text)).length;
  }, [previewQuestions, questions]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ('dataTransfer' in e) { e.preventDefault(); file = e.dataTransfer.files[0]; }
    else { file = (e.target as HTMLInputElement).files?.[0] || null; }
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { setError('Vui lòng tải lên file định dạng PDF.'); return; }

    setIsUploading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + "\n\n";
      }
      const chunkSize = 8000;
      const chunks: string[] = [];
      let currentPos = 0;
      while (currentPos < fullText.length) { chunks.push(fullText.substring(currentPos, currentPos + chunkSize)); currentPos += chunkSize; }
      setProgress({ current: 0, total: chunks.length });
      const allParsedQuestions: Question[] = [];
      for (let i = 0; i < chunks.length; i++) {
        setProgress(prev => ({ ...prev, current: i + 1 }));
        const batchQuestions = await parseQuestionBatch(chunks[i], i + 1);
        allParsedQuestions.push(...batchQuestions);
        setPreviewQuestions([...allParsedQuestions]);
      }
    } catch (err: any) { setError(err.message || 'Lỗi xử lý file.'); } finally { setIsUploading(false); }
  };

  const handleAIGenerate = async () => {
    if (!topic) return;
    setIsUploading(true);
    setError(null);
    setProgress({ current: 1, total: 1 });
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Hãy tạo ${numQuestions} câu hỏi trắc nghiệm về chủ đề: ${topic}. Mỗi câu có 4 lựa chọn A, B, C, D, có đáp án đúng và giải thích. Tránh các câu hỏi quá đơn giản.`,
        config: {
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
      const formatted = data.map((q: any) => ({
        ...q,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: Date.now(),
        seenCount: 0,
        choices: q.choices.map((c: any) => ({ ...c, id: Math.random().toString(36).substr(2, 9) }))
      }));
      setPreviewQuestions(formatted);
    } catch (err: any) { setError('AI gặp lỗi khi sinh câu hỏi. Thử lại sau.'); } finally { setIsUploading(false); }
  };

  const removeDuplicatesFromPreview = () => {
    const originalCount = previewQuestions.length;
    const filtered = previewQuestions.filter(q => !checkIsDuplicate(q.text));
    setPreviewQuestions(filtered);
    alert(`Đã loại bỏ ${originalCount - filtered.length} câu hỏi trùng lặp.`);
  };

  const handleSave = () => { 
    const finalQuestions = previewQuestions.filter(q => !checkIsDuplicate(q.text));
    if (finalQuestions.length < previewQuestions.length) {
      if (!window.confirm(`Phát hiện ${previewQuestions.length - finalQuestions.length} câu trùng lặp sẽ bị tự động bỏ qua. Bạn có muốn tiếp tục lưu?`)) {
        return;
      }
    }
    onAddQuestions(finalQuestions); 
    navigate('/bank'); 
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn pb-24 px-1">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Thêm câu hỏi thông minh</h1>
        <p className="text-gray-500 font-medium">Sử dụng AI để xử lý tài liệu hoặc sinh câu hỏi từ chủ đề.</p>
      </div>

      {!isUploading && previewQuestions.length === 0 && (
        <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-gray-100 flex gap-2">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`flex-grow py-4 rounded-3xl font-black text-sm transition-all ${activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <i className="fas fa-file-pdf mr-2"></i> NHẬP TỪ FILE PDF
          </button>
          <button 
            onClick={() => setActiveTab('ai-gen')}
            className={`flex-grow py-4 rounded-3xl font-black text-sm transition-all ${activeTab === 'ai-gen' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <i className="fas fa-magic mr-2"></i> TẠO BẰNG CHỦ ĐỀ
          </button>
        </div>
      )}

      {!isUploading && previewQuestions.length === 0 && (
        activeTab === 'upload' ? (
          <div onDragOver={(e) => e.preventDefault()} onDrop={handleFileUpload} className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center transition-all hover:border-indigo-400 hover:bg-indigo-50/10 cursor-pointer">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 text-4xl shadow-inner"><i className="fas fa-file-pdf"></i></div>
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Kéo thả file PDF</h3>
            <label className="mt-8 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black cursor-pointer hover:bg-black transition-all shadow-xl"><input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} />CHỌN FILE PDF</label>
            {error && <div className="mt-6 text-red-600 font-bold">{error}</div>}
          </div>
        ) : (
          <div className="bg-white p-12 md:p-16 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Chủ đề cần tạo câu hỏi</label>
              <input 
                type="text" 
                placeholder="Ví dụ: Lịch sử Việt Nam, Giải tích 12, Kiến thức xã hội..." 
                className="w-full px-8 py-6 rounded-3xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-lg"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-6">
               <div className="flex-grow space-y-2">
                 <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Số lượng câu</label>
                 <input type="range" min="5" max="30" step="5" value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                 <div className="flex justify-between text-[10px] font-black text-indigo-400"><span>5 CÂU</span><span>{numQuestions} CÂU</span><span>30 CÂU</span></div>
               </div>
               <button onClick={handleAIGenerate} disabled={!topic} className="px-12 py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 disabled:opacity-30 transition-all flex items-center gap-3">
                 TẠO NGAY <i className="fas fa-sparkles"></i>
               </button>
            </div>
          </div>
        )
      )}

      {isUploading && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-indigo-100 shadow-2xl flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl animate-spin"><i className="fas fa-sync-alt"></i></div>
          <div>
            <h3 className="text-xl font-black text-gray-900">AI đang phân tích dữ liệu...</h3>
            <p className="text-sm text-gray-400">Hệ thống đang chuẩn hóa và trích xuất câu hỏi.</p>
            <div className="w-64 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${(progress.current/progress.total)*100}%` }}></div></div>
          </div>
        </div>
      )}

      {previewQuestions.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-20 z-10 gap-4">
            <div>
              <h4 className="font-black text-gray-900">Xem trước {previewQuestions.length} câu hỏi</h4>
              {duplicateCount > 0 && (
                <p className="text-red-500 text-xs font-black uppercase mt-1">
                  <i className="fas fa-exclamation-triangle mr-1"></i> Phát hiện {duplicateCount} câu trùng với kho dữ liệu
                </p>
              )}
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => setPreviewQuestions([])} className="flex-grow md:flex-grow-0 px-6 py-4 text-gray-400 font-black text-xs">HỦY</button>
              {duplicateCount > 0 && (
                <button 
                  onClick={removeDuplicatesFromPreview} 
                  className="flex-grow md:flex-grow-0 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs hover:bg-red-100 transition-all"
                >
                  XÓA CÂU TRÙNG
                </button>
              )}
              <button 
                onClick={handleSave} 
                className="flex-grow md:flex-grow-0 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all"
              >
                LƯU VÀO KHO
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {previewQuestions.map((q, idx) => {
              const isDuplicate = checkIsDuplicate(q.text);
              return (
                <div key={q.id} className={`bg-white p-8 rounded-[2.5rem] border-2 shadow-sm space-y-4 relative overflow-hidden transition-all ${isDuplicate ? 'border-red-100 bg-red-50/10' : 'border-gray-50'}`}>
                  {isDuplicate && (
                    <div className="absolute top-4 right-8 bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                      <i className="fas fa-copy mr-1"></i> Trùng lặp
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400">#{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      q.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                      q.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <p className={`text-xl font-bold leading-tight ${isDuplicate ? 'text-red-900/40' : 'text-gray-800'}`}>
                    {q.text}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.choices.map(c => (
                      <div key={c.id} className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                        c.isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-50 text-gray-500'
                      } ${isDuplicate ? 'opacity-30' : ''}`}>
                        <span className="font-black w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm">{c.label}</span> 
                        <span className="font-bold text-sm">{c.text}</span>
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <p className={`text-xs italic font-medium pt-2 border-t border-gray-50 ${isDuplicate ? 'text-gray-300' : 'text-gray-400'}`}>
                      <i className="fas fa-info-circle mr-1"></i> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadView;
