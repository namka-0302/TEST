
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Question } from '../types';

interface LearningModeProps {
  questions: Question[];
  onMarkSeen: (id: string) => void;
}

const LearningMode: React.FC<LearningModeProps> = ({ questions, onMarkSeen }) => {
  // sessionQueue lưu trữ thứ tự ID các câu hỏi sẽ xuất hiện trong phiên này
  const [sessionQueue, setSessionQueue] = useState<string[]>([]);
  const [currentQueueIdx, setCurrentQueueIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Khởi tạo hàng đợi ban đầu: Ưu tiên những câu chưa thuộc (seenCount = 0)
  useEffect(() => {
    if (questions.length > 0 && !isLoaded) {
      const unseen = questions.filter(q => q.seenCount === 0).map(q => q.id);
      const seen = questions.filter(q => q.seenCount > 0).sort((a, b) => a.seenCount - b.seenCount).map(q => q.id);
      
      // Trộn ngẫu nhiên danh sách câu hỏi để bắt đầu
      const initialQueue = [...unseen, ...seen];
      setSessionQueue(initialQueue);
      setIsLoaded(true);
    }
  }, [questions, isLoaded]);

  const currentQId = sessionQueue[currentQueueIdx];
  const currentQ = useMemo(() => questions.find(q => q.id === currentQId), [questions, currentQId]);

  const handleNext = () => {
    if (!currentQ) return;

    const correctChoice = currentQ.choices.find(c => c.isCorrect);
    const isAnswerCorrectLocal = selectedChoiceId === correctChoice?.id;

    if (isAnswerCorrectLocal) {
      // ĐÚNG: Gửi tín hiệu đánh dấu đã thuộc lên hệ thống
      onMarkSeen(currentQ.id);
      
      // Chuyển sang câu tiếp theo trong hàng đợi
      setCurrentQueueIdx(prev => prev + 1);
    } else {
      // SAI: Chèn câu này vào vị trí cách đó 5 câu trong tương lai
      const newQueue = [...sessionQueue];
      // Vị trí chèn là index hiện tại + 5 (làm thêm 4 câu rồi gặp lại)
      const targetIdx = currentQueueIdx + 5;
      
      // Chèn ID câu hiện tại vào vị trí target
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

  const handleResetProgress = () => {
    if (confirm("Bạn có muốn bắt đầu lại phiên học từ đầu?")) {
      setIsLoaded(false);
      setCurrentQueueIdx(0);
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

  // Nếu đã hoàn thành hết hàng đợi
  if (isLoaded && currentQueueIdx >= sessionQueue.length) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-xl mt-10 animate-fadeIn">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          <i className="fas fa-check-double"></i>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Tuyệt vời!</h2>
        <p className="text-gray-500 mt-2 font-medium">Bạn đã hoàn thành phiên học hiện tại.</p>
        <button 
          onClick={() => { setIsLoaded(false); setCurrentQueueIdx(0); }}
          className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all"
        >
          TIẾP TỤC HỌC MỚI
        </button>
      </div>
    );
  }

  if (!currentQ) return null;

  // Calculate if the selected answer is correct to be used in the JSX below
  const isAnswerCorrect = selectedChoiceId === currentQ.choices.find(c => c.isCorrect)?.id;

  // TIẾN ĐỘ THỰC TẾ (Cả hệ thống)
  const totalMastered = questions.filter(q => q.seenCount > 0).length;
  const globalProgress = Math.round((totalMastered / questions.length) * 100);
  
  // Tiến độ phiên học hiện tại
  const sessionProgress = (currentQueueIdx / sessionQueue.length) * 100;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-7rem)] md:h-auto animate-fadeIn gap-2 px-1">
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
          <i className="fas fa-redo text-[8px]"></i> Học lại từ đầu
        </button>
      </div>

      <div className="flex-grow flex flex-col bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="h-1.5 w-full bg-gray-50 flex">
          <div 
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${sessionProgress}%` }}
          ></div>
        </div>

        <div className="flex-grow overflow-y-auto p-5 md:p-8 space-y-5 custom-scrollbar flex flex-col">
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                  currentQ.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                  currentQ.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {currentQ.difficulty}
                </span>
                {currentQ.seenCount > 0 && (
                  <span className="text-[8px] px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                    <i className="fas fa-check"></i> Đã thuộc
                  </span>
                )}
             </div>
             <span className="font-mono text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                Câu {currentQueueIdx + 1} / {sessionQueue.length}
             </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-gray-800 leading-snug">
            {currentQ.text}
          </h3>

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
                  {revealed && isCorrect && <i className="fas fa-check-circle text-green-600 text-lg animate-bounce"></i>}
                  {revealed && isSelected && !isCorrect && <i className="fas fa-times-circle text-red-600 text-lg"></i>}
                </button>
              );
            })}
          </div>

          {revealed && (
            <div className="animate-slideUp mt-2 pb-2">
              <div className={`p-4 rounded-2xl border relative ${
                isAnswerCorrect ? 'bg-green-50 border-green-100' : 'bg-indigo-50 border-indigo-100'
              }`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                  isAnswerCorrect ? 'text-green-600' : 'text-indigo-400'
                }`}>
                  {isAnswerCorrect ? 'Bạn trả lời đúng!' : 'Cần chú ý hơn'}
                </p>
                <p className="text-xs md:text-sm text-indigo-900 leading-relaxed font-medium italic">
                  {currentQ.explanation || 'Hãy ghi nhớ đáp án đúng là ' + currentQ.choices.find(c => c.isCorrect)?.label + '.'}
                  {!isAnswerCorrect && <span className="block mt-2 font-black text-red-600 uppercase text-[10px]">Câu này sẽ xuất hiện lại sau 4 câu nữa.</span>}
                </p>
              </div>
            </div>
          )}
        </div>

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
            <p className="text-[9px] font-black uppercase text-indigo-300 tracking-widest leading-none">TỔNG TIẾN ĐỘ</p>
            <p className="text-[10px] font-bold mt-1">{totalMastered} / {questions.length} câu đã thuộc</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-black leading-none">{questions.length - totalMastered}</p>
          <p className="text-[8px] font-black uppercase text-indigo-300 tracking-tighter mt-1">CẦN HỌC</p>
        </div>
      </div>
    </div>
  );
};

export default LearningMode;
