
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { parseQuestionBatch } from '../services/geminiService';
import { Question } from '../types';

// Set up worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;

interface UploadViewProps {
  onAddQuestions: (questions: Question[]) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ onAddQuestions }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    
    if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files[0];
    } else {
      file = (e.target as HTMLInputElement).files?.[0] || null;
    }

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Vui lòng tải lên file định dạng PDF.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setPreviewQuestions([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + "\n\n";
      }

      const chunkSize = 8000;
      const chunks: string[] = [];
      let currentPos = 0;
      
      while (currentPos < fullText.length) {
        chunks.push(fullText.substring(currentPos, currentPos + chunkSize));
        currentPos += chunkSize;
      }

      setProgress({ current: 0, total: chunks.length });
      const allParsedQuestions: Question[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        setProgress(prev => ({ ...prev, current: i + 1 }));
        const batchQuestions = await parseQuestionBatch(chunks[i], i + 1);
        allParsedQuestions.push(...batchQuestions);
        setPreviewQuestions([...allParsedQuestions]);
      }

    } catch (err: any) {
      setError(err.message || 'Lỗi khi xử lý file PDF.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onAddQuestions(previewQuestions);
    navigate('/bank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn pb-24 px-1">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Trí tuệ nhân tạo (AI) Import</h1>
        <p className="text-gray-500 font-medium text-lg">Tải lên file câu hỏi (PDF/Word), AI sẽ tự động phân tích và tạo ngân hàng câu hỏi cho bạn.</p>
      </div>

      {!isUploading && previewQuestions.length === 0 ? (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileUpload}
          className="bg-white p-12 md:p-20 rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center transition-all hover:border-indigo-400 hover:bg-indigo-50/10 group cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="w-24 h-24 bg-indigo-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 group-hover:-rotate-6">
            <i className="fas fa-file-pdf text-5xl"></i>
          </div>
          
          <div className="text-center space-y-3 z-10">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Kéo thả file PDF vào đây</h3>
            <p className="text-gray-400 font-medium">Hoặc click để chọn tệp từ máy tính</p>
          </div>

          <div className="mt-10 z-10">
            <label className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black cursor-pointer hover:bg-black shadow-2xl transition-all inline-block active:scale-95">
              CHỌN FILE PDF
              <input 
                type="file" 
                className="hidden" 
                accept="application/pdf" 
                onChange={handleFileUpload} 
              />
            </label>
          </div>

          {error && (
            <div className="mt-8 p-5 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm border border-red-100 animate-shake">
              <i className="fas fa-exclamation-triangle"></i>
              <span className="font-bold">{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {isUploading && (
            <div className="bg-white p-10 rounded-[2.5rem] border border-indigo-100 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-50 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-700 ease-out"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl animate-pulse">
                      <i className="fas fa-robot"></i>
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-gray-900">AI đang phân tích...</h3>
                     <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Giai đoạn: Batch {progress.current}/{progress.total}</p>
                   </div>
                </div>
                <div className="text-right">
                   <span className="text-3xl font-black text-indigo-600 leading-none">
                     {Math.round((progress.current / progress.total) * 100)}%
                   </span>
                </div>
              </div>
            </div>
          )}

          {previewQuestions.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl sticky top-20 z-10 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                   <i className="fas fa-check-double"></i>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 leading-tight">Đã tìm thấy {previewQuestions.length} câu hỏi</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Sẵn sàng để đưa vào ngân hàng</p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                {!isUploading && (
                  <button onClick={() => setPreviewQuestions([])} className="flex-grow md:flex-grow-0 px-6 py-4 text-gray-400 hover:text-red-500 font-black text-xs uppercase transition-all">Hủy bỏ</button>
                )}
                <button onClick={handleSave} disabled={isUploading} className="flex-grow md:flex-grow-0 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95">
                  LƯU VÀO NGÂN HÀNG
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {previewQuestions.map((q, idx) => (
              <div key={q.id} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-indigo-200 transition-all group">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400">#{idx + 1}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      q.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                      q.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>{q.difficulty}</span>
                  </div>
                  <i className="fas fa-magic text-indigo-100 group-hover:text-indigo-600 transition-colors"></i>
                </div>
                <p className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">{q.text}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {q.choices.map((choice) => (
                    <div key={choice.id} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${choice.isCorrect ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-gray-50 border-gray-50'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${choice.isCorrect ? 'bg-green-600 text-white' : 'bg-white text-gray-300'}`}>
                        {choice.label}
                      </div>
                      <span className="font-bold text-sm text-gray-700">{choice.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadView;
