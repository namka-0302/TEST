
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface LearningModeProps {
  questions: Question[];
  onMarkSeen: (id: string) => void;
}

const LearningMode: React.FC<LearningModeProps> = ({ questions, onMarkSeen }) => {
  // Ưu tiên các câu hỏi ít được xem nhất lên đầu
  const sortedQuestions = [...questions].sort((a, b) => a.seenCount - b.seenCount);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Khôi phục tiến độ từ localStorage khi mount
  useEffect(() => {
    const savedIdx = localStorage.getItem('quizmaster_learn_last_idx');
    if (savedIdx && parseInt(savedIdx) < sortedQuestions.length) {
      setCurrentIdx(parseInt(savedIdx));
    }
    setIsLoaded(true);
  }, [sortedQuestions.length]);

  // Lưu tiến độ vào localStorage mỗi khi thay đổi câu hỏi
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('quizmaster_learn_last_idx', currentIdx.toString());
    }
  }, [currentIdx, isLoaded]);

  const currentQ = sortedQuestions[currentIdx];

  const handleNext = () => {
    if (currentQ) {
      onMarkSeen(currentQ.id);
    }
    
    // Nếu là câu hỏi cuối cùng, quay lại đầu
    const nextIdx = (currentIdx + 1) % sortedQuestions.length;
    setCurrentIdx(nextIdx);
    setRevealed(false);
    setSelectedChoiceId(null);
  };

  const handleChoiceSelect = (choiceId: string) => {
    if (revealed) return;
    setSelectedChoiceId(choiceId);
    setRevealed(true);
  };

  const handleResetProgress = () => {
    if (confirm("Bạn có muốn quay lại học từ câu đầu tiên?")) {
      setCurrentIdx(0);
      localStorage.setItem('quizmaster_learn_last_idx', '0');
    }
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-10">
        <i className="fas fa-book-reader text-5xl text-indigo-100 mb-4"></i>
        <h2 className="text-xl font-bold text-gray-800">Chưa có nội dung</h2>
        <p className="text-gray-400 mt-2 text-sm">Hãy thêm câu hỏi vào ngân hàng để bắt đầu.</p>
      </div>
    );
  }

  const totalSeen = questions.filter(q => q.seenCount > 0).length;
  const globalProgress = Math.round((totalSeen / questions.length) * 100);
  const sessionProgress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-7rem)] md:h-auto animate-fadeIn gap-2 px-1">
      {/* Mini Header - Compact for Mobile */}
      <div className="flex items-center justify-between px-3 py-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-[10px]">
            <i className="fas fa-lightbulb"></i>
          </div>
          <h1 className="text-sm font-black text-gray-900 leading-none">Chế độ học tập</h1>
        </div>
        <button 
          onClick={handleResetProgress}
          className="text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
        >
          <i className="fas fa-redo text-[8px]"></i> Lặp lại từ đầu
        </button>
      </div>

      {/* Main Question Card - Flexible Height */}
      <div className="flex-grow flex flex-col bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
        {/* Progress Bar fixed on top of card */}
        <div className="h-1 w-full bg-gray-50 flex">
          <div 
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${sessionProgress}%` }}
          ></div>
        </div>

        <div className="flex-grow overflow-y-auto p-5 md:p-8 space-y-5 custom-scrollbar flex flex-col">
          {/* Metadata Row */}
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                  currentQ.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                  currentQ.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {currentQ.difficulty}
                </span>
                <span className="text-[8px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-black uppercase tracking-widest">
                  Lần học: {currentQ.seenCount}
                </span>
             </div>
             <span className="font-mono text-[10px] font-black text-gray-300">
                {currentIdx + 1} / {questions.length}
             </span>
          </div>

          {/* Question Text - Responsive font size */}
          <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-snug">
            {currentQ.text}
          </h3>

          {/* Choices Grid - Compact and Easy to Touch */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            {currentQ.choices.map(choice => {
              const isCorrect = choice.isCorrect;
              const isSelected = selectedChoiceId === choice.id;
              
              let statusClasses = 'bg-gray-50 border-gray-50 hover:border-indigo-200';
              if (revealed) {
                if (isCorrect) statusClasses = 'bg-green-50 border-green-600 text-green-800 scale-[1.01] shadow-sm z-10';
                else if (isSelected) statusClasses = 'bg-red-50 border-red-600 text-red-800 opacity-60';
                else statusClasses = 'bg-gray-50 border-gray-50 opacity-40';
              }

              return (
                <button
                  key={choice.id}
                  disabled={revealed}
                  onClick={() => handleChoiceSelect(choice.id)}
                  className={`flex items-center gap-3 p-3.5 md:p-5 rounded-2xl border-2 transition-all text-left group ${statusClasses}`}
                >
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-sm md:text-lg shrink-0 transition-colors ${
                    revealed && isCorrect ? 'bg-green-600 text-white' : 'bg-white text-gray-400 border border-gray-100 group-hover:text-indigo-600'
                  }`}>
                    {choice.label}
                  </div>
                  <span className="font-bold text-sm md:text-base text-gray-700 flex-grow">{choice.text}</span>
                  {revealed && isCorrect && <i className="fas fa-check-circle text-green-600 text-lg"></i>}
                  {revealed && isSelected && !isCorrect && <i className="fas fa-times-circle text-red-600 text-lg"></i>}
                </button>
              );
            })}
          </div>

          {/* Explanation Area - Only shows when revealed, inside scroll area if needed */}
          {revealed && (
            <div className="animate-slideUp mt-2 pb-2">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 relative">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Giải thích chi tiết</p>
                <p className="text-xs md:text-sm text-indigo-900 leading-relaxed font-medium italic">
                  {currentQ.explanation || 'Hãy tập trung vào khái niệm cốt lõi của câu hỏi này. Đáp án đúng là ' + currentQ.choices.find(c => c.isCorrect)?.label + '.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Button at the bottom of the card */}
        {revealed && (
          <div className="p-4 bg-white border-t border-gray-50 mt-auto">
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              CÂU TIẾP THEO
              <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Progress Bar - Minimalist */}
      <div className="bg-indigo-900 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between shrink-0 mb-2">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90">
              <circle className="text-white/10" strokeWidth="3" stroke="currentColor" fill="transparent" r="14" cx="16" cy="16" />
              <circle className="text-indigo-400" strokeWidth="3" strokeDasharray={88} strokeDashoffset={88 - (88 * globalProgress / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="14" cx="16" cy="16" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black">{globalProgress}%</span>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest leading-none">Hoàn thành</p>
            <p className="text-[10px] font-bold mt-1">{totalSeen} / {questions.length} câu</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-black leading-none">{questions.length - totalSeen}</p>
          <p className="text-[8px] font-black uppercase text-indigo-300 tracking-tighter mt-1">Còn lại</p>
        </div>
      </div>
    </div>
  );
};

export default LearningMode;
