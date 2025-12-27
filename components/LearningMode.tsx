
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  
  // Ref để theo dõi số lượng câu hỏi cũ, giúp trigger cập nhật queue khi cloud sync xong
  const lastQuestionsCount = useRef(0);

  useEffect(() => {
    // Nếu có sự thay đổi đáng kể về số lượng câu hỏi (ví dụ: từ 0 lên X sau khi sync cloud)
    // Hoặc nếu queue đang trống mà questions đã có dữ liệu
    if (questions.length > 0 && (sessionQueue.length === 0 || questions.length !== lastQuestionsCount.current)) {
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

      // Chỉ khởi tạo lại toàn bộ nếu queue đang trống (lần đầu sync)
      // Nếu đang học mà có câu hỏi mới, chúng ta có thể nối thêm vào cuối (tùy logic, ở đây ưu tiên khởi tạo session sạch)
      if (sessionQueue.length === 0) {
        const initialQueue = [...shuffleArray(unseen), ...shuffleArray(seen)];
        setSessionQueue(initialQueue);
        lastQuestionsCount.current = questions.length;
      }
    }
  }, [questions, sessionQueue.length]);

  const currentQId = sessionQueue[currentQueueIdx];
  const currentQ = useMemo(() => questions.find(q => q.id === currentQId), [questions, currentQId]);

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

  const handleReset = () => {
    if(confirm("Làm mới phiên học tập hiện tại?")) {
      setSessionQueue([]);
      setCurrentQueueIdx(0);
      setRevealed(false);
      setSelectedChoiceId(null);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xl mt-10 px-6">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl">
          <i className="fas fa-sync-alt fa-spin"></i>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Đang tải học liệu...</h2>
        <p className="text-gray-400 mt-2 font-medium">Hệ thống đang đồng bộ dữ liệu từ Cloud. Vui lòng đợi trong giây lát.</p>
      </div>
    );
  }

  if (sessionQueue.length > 0 && currentQueueIdx >= sessionQueue.length) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xl mt-10 px-6 animate-fadeIn">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-4xl shadow-lg shadow-green-100 rotate-6">
          <i className="fas fa-check-double"></i>
        </div>
        <h2 className="text-3xl font-black text-gray-900">Hoàn thành xuất sắc!</h2>
        <p className="text-gray-500 mt-3 font-medium text-lg">Bạn đã ôn tập xong các câu hỏi trong phiên này.</p>
        <button 
          onClick={() => { setSessionQueue([]); setCurrentQueueIdx(0); }}
          className="mt-10 px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
        >
          TIẾP TỤC ÔN TẬP
        </button>
      </div>
    );
  }

  if (!currentQ) return (
    <div className="flex justify-center items-center py-20">
       <i className="fas fa-circle-notch fa-spin text-indigo-600 text-4xl"></i>
    </div>
  );

  const totalMastered = questions.filter(q => q.seenCount > 0).length;
  const globalProgress = Math.round((totalMastered / questions.length) * 100);
  const sessionProgress = (currentQueueIdx / sessionQueue.length) * 100;

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-6rem)] animate-fadeIn gap-6 px-2 pb-10">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-[2rem] border border-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
            <i className="fas fa-lightbulb"></i>
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 uppercase tracking-tighter">Chế độ học tập</h1>
            <p className="text-[10px] font-bold text-gray-400">Tối ưu hóa ghi nhớ dài hạn</p>
          </div>
        </div>
        <button 
          onClick={handleReset}
          className="text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm"
        >
          <i className="fas fa-redo text-[9px]"></i> RESET
        </button>
      </div>

      {/* Main Question Card */}
      <div className="flex-grow flex flex-col bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-50 overflow-hidden">
        {/* Top Progress Bar */}
        <div className="h-2 w-full bg-gray-50">
          <div 
            className="bg-indigo-600 h-full transition-all duration-700 ease-in-out"
            style={{ width: `${sessionProgress}%` }}
          ></div>
        </div>

        <div className="flex-grow flex flex-col p-8 md:p-14 lg:p-20">
          {/* Question Metadata */}
          <div className="flex justify-between items-center mb-10">
             <div className="flex gap-2">
                <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${
                  currentQ.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                  currentQ.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {currentQ.difficulty}
                </span>
                {currentQ.seenCount > 0 && (
                  <span className="text-[10px] px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-black uppercase tracking-widest flex items-center gap-2 border border-indigo-100">
                    <i className="fas fa-check-circle"></i> ĐÃ THUỘC
                  </span>
                )}
             </div>
             <span className="font-mono text-[11px] font-black text-gray-300 uppercase tracking-widest">
                CÂU {currentQueueIdx + 1} / {sessionQueue.length}
             </span>
          </div>

          {/* Question Text - Responsive font size */}
          <h3 className="text-2xl md:text-4xl font-black text-gray-800 leading-[1.25] mb-12">
            {currentQ.text}
          </h3>

          {/* Choices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.choices.map(choice => {
              const isCorrect = choice.isCorrect;
              const isSelected = selectedChoiceId === choice.id;
              
              let statusClasses = 'bg-gray-50 border-gray-50 hover:border-indigo-200 hover:bg-white';
              if (revealed) {
                if (isCorrect) statusClasses = 'bg-green-50 border-green-600 text-green-800 scale-[1.02] shadow-xl z-10';
                else if (isSelected) statusClasses = 'bg-red-50 border-red-600 text-red-800 opacity-60';
                else statusClasses = 'bg-gray-50 border-gray-50 opacity-40';
              }

              return (
                <button
                  key={choice.id}
                  disabled={revealed}
                  onClick={() => handleChoiceSelect(choice.id)}
                  className={`flex items-center gap-5 p-6 md:p-8 rounded-[2.5rem] border-2 transition-all text-left group ${statusClasses}`}
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shrink-0 transition-all ${
                    revealed && isCorrect ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 group-hover:text-indigo-600'
                  }`}>
                    {choice.label}
                  </div>
                  <span className="font-bold text-lg md:text-xl text-gray-700 flex-grow leading-tight">{choice.text}</span>
                  {revealed && isCorrect && <i className="fas fa-check-circle text-green-600 text-3xl animate-bounce"></i>}
                  {revealed && isSelected && !isCorrect && <i className="fas fa-times-circle text-red-600 text-3xl"></i>}
                </button>
              );
            })}
          </div>

          {/* Explanation Area */}
          {revealed && (
            <div className="animate-slideUp mt-10">
              <div className={`p-8 rounded-[3rem] border-2 relative overflow-hidden ${
                isAnswerCorrect ? 'bg-green-50 border-green-100/50' : 'bg-indigo-50 border-indigo-100/50'
              }`}>
                <div className={`text-[11px] font-black uppercase tracking-[0.2em] mb-3 ${
                  isAnswerCorrect ? 'text-green-600' : 'text-indigo-400'
                }`}>
                  {isAnswerCorrect ? '⚡ CHÍNH XÁC!' : '💡 HÃY GHI NHỚ'}
                </div>
                <p className="text-base md:text-lg text-indigo-950 leading-relaxed font-bold italic">
                  {currentQ.explanation || 'Đáp án đúng là ' + currentQ.choices.find(c => c.isCorrect)?.label + ': ' + currentQ.choices.find(c => c.isCorrect)?.text}
                </p>
                {!isAnswerCorrect && (
                   <div className="mt-6 flex items-center gap-3 text-red-600/70">
                      <i className="fas fa-redo-alt animate-spin-slow text-sm"></i>
                      <span className="font-black text-[10px] uppercase tracking-wider">Hệ thống sẽ lặp lại câu này để bạn ghi nhớ</span>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Button - Always sticky at bottom of card when revealed */}
        {revealed && (
          <div className="p-8 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100 mt-auto">
            <button 
              onClick={handleNext}
              className="w-full py-6 bg-gray-900 text-white rounded-[2rem] font-black text-base hover:bg-black shadow-2xl transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
            >
              TIẾP TỤC HÀNH TRÌNH
              <i className="fas fa-arrow-right text-xs group-hover:translate-x-2 transition-transform"></i>
            </button>
          </div>
        )}
      </div>

      {/* Global Progress Indicator */}
      <div className="bg-indigo-950 text-white px-10 py-6 rounded-[3rem] shadow-2xl flex items-center justify-between shrink-0 border border-indigo-900">
        <div className="flex items-center gap-6">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90">
              <circle className="text-white/5" strokeWidth="5" stroke="currentColor" fill="transparent" r="24" cx="28" cy="28" />
              <circle className="text-indigo-400 transition-all duration-1000" strokeWidth="5" strokeDasharray={150} strokeDashoffset={150 - (150 * globalProgress / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="24" cx="28" cy="28" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black">{globalProgress}%</span>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.2em] leading-none mb-1">TIẾN ĐỘ TỔNG THỂ</p>
            <p className="text-sm font-bold">{totalMastered} / {questions.length} câu đã thuộc</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-200 mb-2">HÔM NAY</span>
          <h4 className="text-3xl font-black leading-none">{questions.length - totalMastered}</h4>
          <p className="text-[9px] font-black uppercase text-indigo-300 tracking-tighter mt-1">CẦN ÔN TẬP</p>
        </div>
      </div>
    </div>
  );
};

export default LearningMode;
