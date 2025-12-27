
import React, { useState, useEffect, useMemo } from 'react';
import { Question } from '../types';

interface LearningModeProps {
  questions: Question[];
  onMarkSeen: (id: string) => void;
}

const LearningMode: React.FC<LearningModeProps> = ({ questions, onMarkSeen }) => {
  const [sessionQueue, setSessionQueue] = useState<string[]>([]);
  const [currentQueueIdx, setCurrentQueueIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (questions.length > 0 && !isLoaded) {
      const unseen = questions.filter(q => q.seenCount === 0).map(q => q.id);
      const seen = questions.filter(q => q.seenCount > 0).sort((a, b) => a.seenCount - b.seenCount).map(q => q.id);
      
      const shuffleArray = (array: string[]) => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      };

      const initialQueue = [...shuffleArray(unseen), ...shuffleArray(seen)];
      setSessionQueue(initialQueue);
      setIsLoaded(true);
    }
  }, [questions, isLoaded]);

  const currentQId = sessionQueue[currentQueueIdx];
  const currentQ = useMemo(() => questions.find(q => q.id === currentQId), [questions, currentQId]);

  // Khai báo isAnswerCorrect ở scope component để dùng trong JSX
  const isAnswerCorrect = useMemo(() => {
    if (!currentQ || !selectedChoiceId) return false;
    return selectedChoiceId === currentQ.choices.find(c => c.isCorrect)?.id;
  }, [currentQ, selectedChoiceId]);

  const handleNext = () => {
    if (!currentQ) return;

    if (isAnswerCorrect) {
      onMarkSeen(currentQ.id);
      setCurrentQueueIdx(prev => prev + 1);
    } else {
      const newQueue = [...sessionQueue];
      const targetIdx = currentQueueIdx + 5;
      if (targetIdx >= newQueue.length) {
        newQueue.push(currentQ.id);
      } else {
        newQueue.splice(targetIdx, 0, currentQ.id);
      }
      setSessionQueue(newQueue);
      setCurrentQueueIdx(prev => prev + 1);
    }

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
      <div className="max-w-2xl mx-auto py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xl mt-10 px-6">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl">
          <i className="fas fa-book-reader"></i>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Chưa có câu hỏi</h2>
        <p className="text-gray-400 mt-2 font-medium">Hãy thêm câu hỏi vào ngân hàng để bắt đầu chế độ học tập thông minh.</p>
      </div>
    );
  }

  if (isLoaded && currentQueueIdx >= sessionQueue.length) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xl mt-10 px-6 animate-fadeIn">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-4xl shadow-lg shadow-green-100 rotate-6">
          <i className="fas fa-check-double"></i>
        </div>
        <h2 className="text-3xl font-black text-gray-900">Hoàn thành xuất sắc!</h2>
        <p className="text-gray-500 mt-3 font-medium text-lg">Bạn đã ôn tập xong tất cả các câu hỏi trong phiên này.</p>
        <button 
          onClick={() => { setIsLoaded(false); setCurrentQueueIdx(0); }}
          className="mt-10 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
        >
          TIẾP TỤC ÔN TẬP
        </button>
      </div>
    );
  }

  if (!currentQ) return null;

  const totalMastered = questions.filter(q => q.seenCount > 0).length;
  const globalProgress = Math.round((totalMastered / questions.length) * 100);
  const sessionProgress = (currentQueueIdx / sessionQueue.length) * 100;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-7rem)] md:h-auto animate-fadeIn gap-4 px-1 pb-10">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-lightbulb"></i>
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Chế độ học tập</h1>
            <p className="text-[10px] font-bold text-gray-400">Ghi nhớ theo phương pháp Spaced Repetition</p>
          </div>
        </div>
        <button 
          onClick={() => { if(confirm("Học lại từ đầu?")) { setIsLoaded(false); setCurrentQueueIdx(0); } }}
          className="text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-50 shadow-sm"
        >
          <i className="fas fa-redo text-[8px]"></i> RESET
        </button>
      </div>

      <div className="flex-grow flex flex-col bg-white rounded-[3rem] shadow-2xl border border-gray-50 overflow-hidden relative">
        <div className="h-2 w-full bg-gray-50 flex">
          <div 
            className="bg-indigo-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${sessionProgress}%` }}
          ></div>
        </div>

        <div className="flex-grow overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar flex flex-col">
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                  currentQ.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                  currentQ.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {currentQ.difficulty}
                </span>
                {currentQ.seenCount > 0 && (
                  <span className="text-[9px] px-3 py-1 bg-green-50 text-green-600 rounded-full font-black uppercase tracking-widest flex items-center gap-1 border border-green-100">
                    <i className="fas fa-check"></i> Đã thuộc
                  </span>
                )}
             </div>
             <span className="font-mono text-[10px] font-black text-gray-300 uppercase">
                Câu {currentQueueIdx + 1} / {sessionQueue.length}
             </span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-gray-800 leading-tight">
            {currentQ.text}
          </h3>

          <div className="grid grid-cols-1 gap-3 pt-4">
            {currentQ.choices.map(choice => {
              const isCorrect = choice.isCorrect;
              const isSelected = selectedChoiceId === choice.id;
              
              let statusClasses = 'bg-gray-50 border-gray-50 hover:border-indigo-200 hover:bg-white';
              if (revealed) {
                if (isCorrect) statusClasses = 'bg-green-50 border-green-600 text-green-800 scale-[1.02] shadow-lg z-10';
                else if (isSelected) statusClasses = 'bg-red-50 border-red-600 text-red-800 opacity-60';
                else statusClasses = 'bg-gray-50 border-gray-50 opacity-40';
              }

              return (
                <button
                  key={choice.id}
                  disabled={revealed}
                  onClick={() => handleChoiceSelect(choice.id)}
                  className={`flex items-center gap-4 p-5 md:p-6 rounded-[2rem] border-2 transition-all text-left group ${statusClasses}`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-base md:text-xl shrink-0 transition-all ${
                    revealed && isCorrect ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 group-hover:text-indigo-600'
                  }`}>
                    {choice.label}
                  </div>
                  <span className="font-bold text-base md:text-lg text-gray-700 flex-grow">{choice.text}</span>
                  {revealed && isCorrect && <i className="fas fa-check-circle text-green-600 text-2xl animate-bounce"></i>}
                  {revealed && isSelected && !isCorrect && <i className="fas fa-times-circle text-red-600 text-2xl"></i>}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="animate-slideUp mt-4 pb-2">
              <div className={`p-6 rounded-[2.5rem] border-2 relative overflow-hidden ${
                isAnswerCorrect ? 'bg-green-50 border-green-100' : 'bg-indigo-50 border-indigo-100'
              }`}>
                <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${
                  isAnswerCorrect ? 'text-green-600' : 'text-indigo-400'
                }`}>
                  {isAnswerCorrect ? 'CHÍNH XÁC!' : 'CẦN CHÚ Ý HƠN'}
                </div>
                <p className="text-sm md:text-base text-indigo-900 leading-relaxed font-bold italic">
                  {currentQ.explanation || 'Hãy ghi nhớ đáp án đúng là ' + currentQ.choices.find(c => c.isCorrect)?.label + '.'}
                </p>
                {!isAnswerCorrect && (
                   <div className="mt-4 flex items-center gap-2 text-red-600">
                      <i className="fas fa-redo-alt animate-spin-slow"></i>
                      <span className="font-black text-[10px] uppercase">Câu này sẽ lặp lại sau 4 câu nữa</span>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>

        {revealed && (
          <div className="p-6 bg-white border-t border-gray-50 mt-auto">
            <button 
              onClick={handleNext}
              className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black text-sm hover:bg-black shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-95"
            >
              CÂU TIẾP THEO
              <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        )}
      </div>

      <div className="bg-indigo-950 text-white px-8 py-4 rounded-[2.5rem] shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90">
              <circle className="text-white/10" strokeWidth="4" stroke="currentColor" fill="transparent" r="18" cx="20" cy="20" />
              <circle className="text-indigo-400" strokeWidth="4" strokeDasharray={113} strokeDashoffset={113 - (113 * globalProgress / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="18" cx="20" cy="20" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black">{globalProgress}%</span>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest leading-none">TIẾN ĐỘ TỔNG THỂ</p>
            <p className="text-xs font-bold mt-1.5">{totalMastered} / {questions.length} câu đã thuộc</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black leading-none">{questions.length - totalMastered}</p>
          <p className="text-[8px] font-black uppercase text-indigo-300 tracking-tighter mt-1">CẦN ÔN TẬP</p>
        </div>
      </div>
    </div>
  );
};

export default LearningMode;
