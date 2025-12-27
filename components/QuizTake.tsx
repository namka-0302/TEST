
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Quiz, QuizResult, User, Question } from '../types';

interface QuizTakeProps {
  quizzes: Quiz[];
  user: User;
  questions?: Question[];
  onComplete?: (questionIds: string[], result: QuizResult) => void;
  isReviewMode?: boolean;
  allResults?: QuizResult[];
}

const QuizTake: React.FC<QuizTakeProps> = ({ quizzes, user, questions = [], onComplete, isReviewMode = false, allResults = [] }) => {
  const { id } = useParams<{ id: string }>();
  
  // Logic tìm đề thi: Ưu tiên tìm theo ID trên URL, nếu không có ID và chỉ có 1 đề thì lấy đề đó (dành cho Thi thử)
  const fixedQuiz = useMemo(() => {
    if (id) return quizzes.find(q => q.id === id);
    if (!isReviewMode && quizzes.length === 1) return quizzes[0];
    return undefined;
  }, [quizzes, id, isReviewMode]);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(isReviewMode);
  const [showReview, setShowReview] = useState(isReviewMode);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [reconstructedQuiz, setReconstructedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (isReviewMode) {
      const pastResult = allResults.find(r => r.quizId === id && r.userId === user.id);
      if (pastResult) {
        setResult(pastResult);
        setAnswers(pastResult.answers);
        
        if (!fixedQuiz && questions.length > 0) {
          const answerIds = Object.keys(pastResult.answers);
          const quizQuestions = questions.filter(q => answerIds.includes(q.id));
          
          setReconstructedQuiz({
            id: pastResult.quizId,
            title: pastResult.quizTitle || 'Bài thi thử ngẫu nhiên',
            questions: quizQuestions,
            durationMinutes: 30,
            createdAt: pastResult.timestamp
          });
        }
      }
    } else if (fixedQuiz) {
      setTimeLeft(fixedQuiz.durationMinutes * 60);
    }
  }, [isReviewMode, fixedQuiz, allResults, id, user.id, questions]);

  const quiz = fixedQuiz || reconstructedQuiz;

  useEffect(() => {
    if (isFinished || timeLeft <= 0 || isReviewMode) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, timeLeft, isReviewMode]);

  const selectAnswer = (questionId: string, choiceId: string) => {
    if (isFinished || isReviewMode) return;
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  const finishQuiz = useCallback(() => {
    if (!quiz || isFinished) return;
    let score = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.choices.find(c => c.isCorrect)?.id) score++;
    });

    const newResult: QuizResult = {
      score,
      totalQuestions: quiz.questions.length,
      timeSpent: quiz.durationMinutes * 60 - timeLeft,
      answers,
      quizId: quiz.id,
      timestamp: Date.now(),
      userId: user.id,
      userName: user.name,
      quizTitle: quiz.title
    };

    setResult(newResult);
    setIsFinished(true);
    onComplete?.(quiz.questions.map(q => q.id), newResult);
  }, [quiz, answers, timeLeft, isFinished, onComplete, user]);

  if (!quiz && !isReviewMode) return <div className="text-center py-40 font-black text-slate-300 animate-pulse uppercase tracking-widest">Đang khởi tạo bài thi...</div>;
  if (!quiz && isReviewMode && !result) return <div className="text-center py-20 font-black text-slate-400">KHÔNG TÌM THẤY DỮ LIỆU LỊCH SỬ</div>;

  const currentQuestion = quiz?.questions[currentQuestionIdx];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished && result && quiz) {
    if (showReview) {
      return (
        <div className="max-w-4xl mx-auto animate-fadeIn px-3 sm:px-6 py-10 space-y-8">
           <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center justify-between sticky top-20 z-50 gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowReview(false)} className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 active:scale-90 transition-all"><i className="fas fa-chevron-left"></i></button>
                <div>
                  <h3 className="font-black text-lg leading-none line-clamp-1">{quiz.title}</h3>
                  <p className="text-xs font-bold text-indigo-600 mt-1">{result.score}/{result.totalQuestions} câu đúng</p>
                </div>
              </div>
              <Link to={user.role === 'Admin' ? '/history' : '/my-history'} className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm text-center">ĐÓNG XEM LẠI</Link>
           </div>
           {quiz.questions.map((q, idx) => {
             const selectedId = result.answers[q.id];
             const isCorrect = selectedId === q.choices.find(c => c.isCorrect)?.id;
             return (
               <div key={q.id} className={`p-8 sm:p-12 rounded-[3rem] bg-white border-2 shadow-sm ${isCorrect ? 'border-emerald-100' : 'border-red-100'}`}>
                 <span className={`text-[10px] font-black uppercase px-4 py-1 rounded-full mb-6 inline-block ${isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{isCorrect ? 'Chính xác' : 'Chưa chính xác'}</span>
                 <h4 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug mb-8">{idx+1}. {q.text}</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {q.choices.map(c => {
                     const isC = c.isCorrect;
                     const isS = selectedId === c.id;
                     let cl = 'bg-slate-50 border-slate-50 opacity-40';
                     if (isC) cl = 'bg-emerald-50 border-emerald-500 text-emerald-900 opacity-100 scale-[1.02] shadow-sm';
                     else if (isS) cl = 'bg-red-50 border-red-500 text-red-900 opacity-100';
                     return <div key={c.id} className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${cl}`}><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isC ? 'bg-emerald-500 text-white' : isS ? 'bg-red-500 text-white' : 'bg-white text-slate-300'}`}>{c.label}</div><span className="font-bold text-sm sm:text-base">{c.text}</span></div>;
                   })}
                 </div>
                 {q.explanation && (
                    <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Giải thích từ AI</p>
                       <p className="text-sm font-medium text-slate-600 italic leading-relaxed">{q.explanation}</p>
                    </div>
                 )}
               </div>
             );
           })}
        </div>
      );
    }
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20 animate-fadeIn">
        <div className="bg-white rounded-[3.5rem] p-10 sm:p-20 text-center border border-slate-100 shadow-2xl relative overflow-hidden space-y-8">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
           <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white text-4xl mx-auto shadow-2xl rotate-3"><i className="fas fa-flag-checkered"></i></div>
           <div><h2 className="text-4xl font-black text-slate-900">Hoàn thành!</h2><p className="text-slate-400 font-medium mt-2">Dữ liệu thi đã được đồng bộ lên Cloud.</p></div>
           <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-6 rounded-3xl"><p className="text-2xl font-black text-indigo-600">{result.score}/{result.totalQuestions}</p><p className="text-[10px] font-black text-slate-400 uppercase mt-1">Câu đúng</p></div>
              <div className="bg-slate-900 p-6 rounded-3xl text-white"><p className="text-2xl font-black">{Math.round((result.score/result.totalQuestions)*100)}%</p><p className="text-[10px] font-black text-slate-400 uppercase mt-1">Kết quả</p></div>
              <div className="bg-slate-50 p-6 rounded-3xl"><p className="text-2xl font-black text-slate-700">{formatTime(result.timeSpent)}</p><p className="text-[10px] font-black text-slate-400 uppercase mt-1">Thời gian</p></div>
           </div>
           <div className="space-y-3 pt-6">
              <button onClick={() => setShowReview(true)} className="w-full bg-slate-100 text-slate-900 py-5 rounded-3xl font-black text-sm hover:bg-slate-200 transition-all">XEM ĐÁP ÁN CHI TIẾT</button>
              <Link to="/" className="w-full block bg-indigo-600 text-white py-6 rounded-3xl font-black text-lg shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all">TRỞ VỀ TRANG CHỦ</Link>
           </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn px-2 sm:px-4 pb-32">
      <div className="sticky top-[4.5rem] sm:top-24 z-[90] bg-slate-50/90 backdrop-blur-md pt-2 pb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-xl gap-4">
           <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0"><i className="fas fa-stopwatch text-xl"></i></div>
              <div className="flex-grow">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Thời gian còn lại</p>
                <p className={`text-2xl font-mono font-black leading-none ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>{formatTime(timeLeft)}</p>
              </div>
           </div>
           <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex-grow sm:flex-grow-0 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tiến độ</p><p className="text-base font-black text-slate-900 text-center">{currentQuestionIdx + 1}/{quiz.questions.length}</p></div>
              <button onClick={finishQuiz} className="flex-grow sm:flex-grow-0 bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-sm hover:bg-black shadow-lg">NỘP BÀI</button>
           </div>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-[3rem] sm:rounded-[4rem] p-8 sm:p-16 border border-slate-50 shadow-2xl space-y-12 min-h-[500px] flex flex-col justify-between">
         <div className="space-y-6">
            <span className="bg-indigo-600 text-white px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">CÂU HỎI {currentQuestionIdx + 1}</span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight">{currentQuestion.text}</h3>
         </div>
         <div className="grid grid-cols-1 gap-4 sm:gap-6">
           {currentQuestion.choices.map(c => (
             <button key={c.id} onClick={() => selectAnswer(currentQuestion.id, c.id)} className={`p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-2 transition-all flex items-center gap-6 text-left group relative overflow-hidden ${answers[currentQuestion.id] === c.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-50 bg-slate-50 hover:border-slate-200 hover:bg-white'}`}>
               <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shrink-0 transition-all ${answers[currentQuestion.id] === c.id ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'bg-white text-slate-400 border border-slate-100 group-hover:text-indigo-600'}`}>{c.label}</div>
               <span className={`text-lg sm:text-2xl font-bold transition-colors ${answers[currentQuestion.id] === c.id ? 'text-indigo-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{c.text}</span>
               {answers[currentQuestion.id] === c.id && <div className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white"><i className="fas fa-check text-xs"></i></div>}
             </button>
           ))}
         </div>
         <div className="flex justify-between items-center pt-10 border-t border-slate-50">
            <button onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))} disabled={currentQuestionIdx === 0} className="flex items-center gap-3 text-slate-400 font-black hover:text-indigo-600 disabled:opacity-0 transition-all px-6 py-3"><i className="fas fa-arrow-left"></i> TRƯỚC</button>
            <button onClick={() => currentQuestionIdx < quiz.questions.length - 1 ? setCurrentQuestionIdx(currentQuestionIdx + 1) : finishQuiz()} className="bg-slate-900 text-white px-10 sm:px-14 py-5 rounded-2xl sm:rounded-3xl font-black hover:bg-black shadow-2xl active:scale-95 transition-all">
               {currentQuestionIdx === quiz.questions.length - 1 ? 'HOÀN TẤT' : 'KẾ TIẾP'} <i className="fas fa-arrow-right ml-3"></i>
            </button>
         </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-max max-w-[90vw] flex gap-2 overflow-x-auto p-4 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] no-scrollbar z-[100] safe-padding-bottom">
        {quiz.questions.map((_, idx) => (
          <button key={idx} onClick={() => setCurrentQuestionIdx(idx)} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shrink-0 transition-all flex items-center justify-center border-2 ${idx === currentQuestionIdx ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-110' : answers[quiz.questions[idx].id] ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white text-slate-300 border-slate-50 hover:border-slate-100'}`}>{idx + 1}</button>
        ))}
      </div>
    </div>
  );
};

export default QuizTake;
