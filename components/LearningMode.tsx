
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface LearningModeProps {
  questions: Question[];
  onMarkSeen: (id: string) => void;
}

const LearningMode: React.FC<LearningModeProps> = ({ questions, onMarkSeen }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  // Focus on least seen questions first
  const sortedQuestions = [...questions].sort((a, b) => a.seenCount - b.seenCount);

  const currentQ = sortedQuestions[currentIdx];

  const handleNext = () => {
    if (currentQ) onMarkSeen(currentQ.id);
    setCurrentIdx((prev) => (prev + 1) % sortedQuestions.length);
    setRevealed(false);
    setSelectedChoiceId(null);
  };

  const handleChoiceSelect = (choiceId: string) => {
    if (revealed) return;
    setSelectedChoiceId(choiceId);
    setRevealed(true);
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
        <i className="fas fa-book-reader text-6xl text-indigo-100 mb-6"></i>
        <h2 className="text-2xl font-bold text-gray-800">No content found</h2>
        <p className="text-gray-400 mt-2">Add some questions to start your learning journey.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Center</h1>
          <p className="text-sm text-gray-500 italic">Smart focus: Prioritizing unseen content</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase">Question</p>
          <p className="font-mono font-bold text-indigo-600">{currentIdx + 1} / {questions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8 min-h-[400px] flex flex-col">
        <div className="space-y-4">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
            currentQ.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
            currentQ.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
          }`}>
            {currentQ.difficulty} Mode
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
            {currentQ.text}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQ.choices.map(choice => {
            const isCorrect = choice.isCorrect;
            const isSelected = selectedChoiceId === choice.id;
            
            let statusClasses = 'bg-gray-50 border-gray-50 hover:border-gray-200';
            if (revealed) {
              if (isCorrect) statusClasses = 'bg-green-50 border-green-600 text-green-800';
              else if (isSelected) statusClasses = 'bg-red-50 border-red-600 text-red-800 opacity-50';
              else statusClasses = 'bg-gray-50 border-gray-50 opacity-30';
            }

            return (
              <button
                key={choice.id}
                disabled={revealed}
                onClick={() => handleChoiceSelect(choice.id)}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${statusClasses}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                  revealed && isCorrect ? 'bg-green-600 text-white' : 'bg-white text-gray-400 border border-gray-100'
                }`}>
                  {choice.label}
                </div>
                <span className="font-semibold">{choice.text}</span>
                {revealed && isCorrect && <i className="fas fa-check-circle text-green-600 ml-auto"></i>}
                {revealed && isSelected && !isCorrect && <i className="fas fa-times-circle text-red-600 ml-auto"></i>}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="mt-auto pt-6 animate-slideUp">
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Explanation</p>
              <p className="text-sm text-indigo-900 leading-relaxed">
                {currentQ.explanation || 'Think about the core concepts related to this topic. The correct answer is ' + currentQ.choices.find(c => c.isCorrect)?.label + '.'}
              </p>
            </div>
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              Continue Practice <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningMode;
