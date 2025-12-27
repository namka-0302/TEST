
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setPreviewQuestions([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + "\n\n";
      }

      // Chunking for Large PDFs
      const chunkSize = 8000; // Smaller chunks for plain text as it's denser than HTML
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
      setError(err.message || 'Failed to process PDF file.');
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">PDF Question Import</h1>
        <p className="text-gray-500 mt-2">Upload your PDF quiz and our AI will extract the questions automatically.</p>
      </div>

      {!isUploading && previewQuestions.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center transition-all hover:border-indigo-400">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <i className="fas fa-file-pdf text-4xl text-red-500"></i>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-800">Select your PDF Quiz</h3>
            <p className="text-gray-400">Best for digital PDFs with selectable text.</p>
          </div>

          <div className="mt-8">
            <label className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all inline-block">
              Choose PDF File
              <input 
                type="file" 
                className="hidden" 
                accept="application/pdf" 
                onChange={handleFileUpload} 
              />
            </label>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {isUploading && (
            <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <i className="fas fa-robot fa-bounce text-indigo-600"></i>
                  <span className="font-bold text-gray-700">AI Extracting Batch {progress.current}/{progress.total}</span>
                </div>
                <span className="text-indigo-600 font-mono font-bold">
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {previewQuestions.length > 0 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-20 z-10">
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  {previewQuestions.length} Questions Found
                </span>
              </div>
              <div className="flex gap-2">
                {!isUploading && (
                  <button onClick={() => setPreviewQuestions([])} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium">Reset</button>
                )}
                <button onClick={handleSave} disabled={isUploading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
                  Add to Question Bank
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {previewQuestions.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-600">QUESTION {idx + 1}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-gray-50 rounded text-gray-500">{q.difficulty}</span>
                </div>
                <p className="font-semibold text-gray-800 mb-4">{q.text}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.choices.map((choice) => (
                    <div key={choice.id} className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${choice.isCorrect ? 'bg-green-50 border-green-200 ring-1 ring-green-100' : 'bg-gray-50 border-gray-100'}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${choice.isCorrect ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {choice.label}
                      </span>
                      {choice.text}
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
