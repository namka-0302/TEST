
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question, Quiz } from '../types';

interface QuizCreatorProps {
  questions: Question[];
  onSaveQuiz: (quiz: Quiz) => void;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ questions, onSaveQuiz }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [randomCount, setRandomCount] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleCreate = () => {
    if (!title || selectedIds.size === 0) return;
    
    const selectedQuestions = questions.filter(q => selectedIds.has(q.id));
    const newQuiz: Quiz = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      durationMinutes: duration,
      questions: selectedQuestions,
      createdAt: Date.now()
    };

    onSaveQuiz(newQuiz);
    navigate('/');
  };

  const selectRandomSmart = () => {
    const count = Math.min(randomCount, questions.length);
    
    // Seen tracking logic:
    // 1. Separate unseen and seen questions
    const unseen = questions.filter(q => q.seenCount === 0);
    const seen = questions.filter(q => q.seenCount > 0).sort((a, b) => a.seenCount - b.seenCount);
    
    let result: string[] = [];
    
    if (unseen.length >= count) {
      // If we have enough unseen, pick randomly from them
      result = [...unseen].sort(() => 0.5 - Math.random()).slice(0, count).map(q => q.id);
    } else {
      // If not enough unseen, take ALL unseen + fill rest from least seen
      const unseenIds = unseen.map(q => q.id);
      const remainingNeeded = count - unseenIds.length;
      const seenIds = seen.slice(0, remainingNeeded).map(q => q.id);
      result = [...unseenIds, ...seenIds];
    }

    setSelectedIds(new Set(result));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Quiz Constructor</h1>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase">Quiz Title</label>
            <input 
              type="text" 
              placeholder="Module 4 Evaluation" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-lg font-semibold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase">Timer (Min)</label>
            <input 
              type="number" 
              className="w-24 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            />
          </div>
          <button 
            onClick={handleCreate}
            disabled={!title || selectedIds.size === 0}
            className="self-end px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
          >
            Create Quiz
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Select Questions</h3>
            <p className="text-gray-500 text-sm">
              {selectedIds.size} / {questions.length} Selected • {questions.filter(q => q.seenCount === 0).length} Unseen left
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
            <span className="text-sm font-bold text-gray-500 px-2 italic">Smart Random:</span>
            <input 
              type="number" 
              className="w-16 px-2 py-1 rounded-lg border border-gray-200 focus:outline-none"
              value={randomCount}
              onChange={(e) => setRandomCount(parseInt(e.target.value) || 0)}
            />
            <button 
              onClick={selectRandomSmart} 
              title="Prioritizes unseen questions"
              className="text-white px-4 py-1.5 rounded-lg bg-indigo-600 font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              Fill Smart
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-bold text-sm transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {questions.map((q) => (
            <div 
              key={q.id}
              onClick={() => toggleSelection(q.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedIds.has(q.id) 
                ? 'border-indigo-600 bg-indigo-50/50' 
                : 'border-gray-50 bg-gray-50 hover:border-gray-200'
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedIds.has(q.id) ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                }`}>
                  {selectedIds.has(q.id) && <i className="fas fa-check text-[10px] text-white"></i>}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{q.text}</p>
                    {q.seenCount > 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded font-bold ml-2">SEEN</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-gray-400 font-bold border border-gray-100 uppercase">
                      {q.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
