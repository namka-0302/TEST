
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Quiz, QuizResult, User } from '../types';

interface QuizTakeProps {
  quizzes: Quiz[];
  user: User;
  onComplete?: (questionIds: string[], result: QuizResult) => void;
  isReviewMode?: boolean;
  allResults?: QuizResult[];
}

const QuizTake: React.FC<QuizTakeProps> = ({ quizzes, user, onComplete, isReviewMode = false, allResults = [] }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const timestampParam = searchParams.get('timestamp');

  const quiz = quizzes.find(q => q.id === id);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz ? quiz.durationMinutes * 60 : 0);
  const [isFinished, setIsFinished] = useState(isReviewMode);
  const [showReview, setShowReview] = useState(isReviewMode);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (isReviewMode && quiz && allResults.length > 0) {
      const pastResult = allResults.find(r => 
        r.quizId === id && 
        r.userId === user.id && 
        (!timestampParam || r.timestamp === parseInt(timestampParam))
      );
      if (pastResult) {
        setResult(pastResult);
        setAnswers(pastResult.answers);
      }
    }
  }, [isReviewMode, quiz, allResults, id, user.id, timestampParam]);

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
      const selectedChoiceId = answers[q.id];
      const correctChoice = q.choices.find(c => c.isCorrect);
      if (selectedChoiceId === correctChoice?.id) {
        score++;
      }
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

  if (!quiz) return <div className="text-center py-20 font-bold text-gray-400">Không tìm thấy bài thi.</div>;

  const currentQuestion = quiz.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx + 1) / quiz.questions.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished && result) {
    if (showReview) {
      return (
        <div className="max-w-4xl mx-auto animate-fadeIn space-y-6 pb-20 px-2 mt-4">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white/50 flex flex-col md:flex-row items-center justify-between sticky top-20 z-50 gap-4">
            <div className="flex items-center gap-4">
               <button onClick={() => setShowReview(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <i className="fas fa-chevron-left text-gray-500"></i>
               </button>
               <div>
                 <h2 className="text-lg font-black text-gray-900 leading-tight">{isReviewMode ? 'Xem lại bài thi' : 'Kết quả chi tiết'}</h2>
                 <p className="text-sm text-indigo-600 font-black">{result.score} / {result.totalQuestions} câu đúng</p>
               </div>
            </div>
            <Link to="/" className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm text-center shadow-lg active:scale-95 transition-all">
               HOÀN TẤT XEM
            </Link>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((q, idx) => {
              const selectedId = result.answers[q.id];
              const correctChoice = q.choices.find(c => c.isCorrect);
              const isCorrect = selectedId === correctChoice?.id;

              return (
                <div key={q.id} className={`p-6 md:p-10 rounded-[2.5rem] bg-white border-2 shadow-sm transition-all ${isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isCorrect ? 'Đáp án đúng' : selectedId ? 'Đáp án sai' : 'Chưa trả lời'}
                    </span>
                    <span className="font-mono text-[10px] font-black text-gray-300">CÂU HỎI {idx + 1}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-8 leading-snug">{q.text}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.choices.map(c => {
                      const isOptionSelected = selectedId === c.id;
                      const isOptionCorrect = c.isCorrect;
                      
                      let choiceClasses = 'bg-gray-50 border-gray-50 opacity-60';
                      if (isOptionCorrect) choiceClasses = 'bg-green-50 border-green-600 text-green-800 scale-[1.01] shadow-sm z-10';
                      else if (isOptionSelected) choiceClasses = 'bg-red-50 border-red-600 text-red-800';

                      return (
                        <div key={c.id} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${choiceClasses}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${
                            isOptionCorrect ? 'bg-green-600 text-white' : isOptionSelected ? 'bg-red-600 text-white' : 'bg-white text-gray-400'
                          }`}>
                            {c.label}
                          </div>
                          <span className="font-bold text-sm md:text-base">{c.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-8 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <i className="fas fa-quote-right text-4xl"></i>
                      </div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Giải thích chi tiết</p>
                      <p className="text-sm md:text-base text-indigo-900 font-medium italic leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto animate-fadeIn px-2 py-10">
        <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-gray-100 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="relative inline-block">
             <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-white text-5xl shadow-2xl rotate-6 animate-float">
               <i className="fas fa-award"></i>
             </div>
             <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center text-white shadow-lg animate-bounce">
               <i className="fas fa-star"></i>
             </div>
          </div>

          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Tuyệt vời!</h2>
            <p className="text-gray-500 mt-2 font-medium">Bạn đã hoàn tất bài thi: <span className="text-indigo-600 font-bold">{quiz.title}</span></p>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-6 py-4">
            <div className="bg-gray-50/80 p-5 rounded-3xl border border-gray-100">
               <h4 className="text-2xl font-black text-indigo-600">{result.score}/{result.totalQuestions}</h4>
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Câu đúng</p>
            </div>
            <div className="bg-indigo-600 p-5 rounded-3xl shadow-lg shadow-indigo-100">
               <h4 className="text-2xl font-black text-white">{Math.round((result.score/result.totalQuestions)*100)}%</h4>
               <p className="text-[8px] font-black text-indigo-200 uppercase tracking-widest mt-1">Kết quả</p>
            </div>
            <div className="bg-gray-50/80 p-5 rounded-3xl border border-gray-100">
               <h4 className="text-2xl font-black text-gray-700">{formatTime(result.timeSpent)}</h4>
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Thời gian</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button onClick={() => setShowReview(true)} className="w-full bg-white text-gray-900 border-2 border-gray-100 py-4 rounded-2xl font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <i className="fas fa-eye text-indigo-500"></i> XEM ĐÁP ÁN CHI TIẾT
            </button>
            <Link to="/" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
              TRỞ VỀ TRANG CHỦ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn px-1 pb-24">
      {/* Immersive Header */}
      <div className="sticky top-20 z-[90] bg-gray-50/80 backdrop-blur-md pt-2 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-lg gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0">
               <i className="fas fa-book-open"></i>
            </div>
            <div>
              <h2 className="font-black text-gray-900 line-clamp-1 text-sm md:text-base">{quiz.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex gap-1">
                   {quiz.questions.map((_, idx) => (
                     <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentQuestionIdx ? 'bg-indigo-600 scale-125' : answers[quiz.questions[idx].id] ? 'bg-indigo-200' : 'bg-gray-100'}`}></div>
                   ))}
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase ml-1">CÂU {currentQuestionIdx + 1} / {quiz.questions.length}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`flex-grow md:flex-grow-0 flex items-center justify-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
              <i className="fas fa-stopwatch text-lg"></i>
              <span className="font-mono text-xl font-black">{formatTime(timeLeft)}</span>
            </div>
            <button onClick={finishQuiz} className="bg-gray-900 text-white px-10 py-3 rounded-2xl text-sm font-black hover:bg-black shadow-xl active:scale-95 transition-all">NỘP BÀI</button>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="mt-4 bg-white rounded-[3rem] p-8 md:p-14 border border-gray-50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] space-y-12 min-h-[550px] flex flex-col transition-all">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">CÂU HỎI {currentQuestionIdx + 1}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-2xl border ${
              currentQuestion.difficulty === 'Easy' ? 'bg-green-50 text-green-600 border-green-100' :
              currentQuestion.difficulty === 'Hard' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
            }`}>{currentQuestion.difficulty}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-gray-800 leading-[1.3]">{currentQuestion.text}</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.choices.map((choice) => (
            <button 
              key={choice.id}
              onClick={() => selectAnswer(currentQuestion.id, choice.id)}
              className={`p-6 md:p-8 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center gap-5 text-left group relative overflow-hidden ${
                answers[currentQuestion.id] === choice.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-50 bg-gray-50 hover:border-gray-200 hover:bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-all ${
                answers[currentQuestion.id] === choice.id ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'bg-white text-gray-400 border border-gray-100 group-hover:text-indigo-600 group-hover:border-indigo-100'
              }`}>{choice.label}</div>
              <span className={`text-lg md:text-xl font-bold transition-colors ${answers[currentQuestion.id] === choice.id ? 'text-indigo-900' : 'text-gray-700 group-hover:text-gray-900'}`}>{choice.text}</span>
              {answers[currentQuestion.id] === choice.id && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] animate-fadeIn">
                   <i className="fas fa-check"></i>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto flex justify-between items-center pt-10 border-t border-gray-100">
          <button 
            onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))} 
            disabled={currentQuestionIdx === 0} 
            className="flex items-center gap-3 text-gray-400 font-black hover:text-indigo-600 disabled:opacity-0 transition-all px-4 py-2"
          >
            <i className="fas fa-arrow-left"></i> TRƯỚC
          </button>
          
          <div className="hidden sm:flex gap-1.5">
             {quiz.questions.map((_, idx) => (
               <button 
                 key={idx}
                 onClick={() => setCurrentQuestionIdx(idx)}
                 className={`w-3 h-3 rounded-full transition-all ${idx === currentQuestionIdx ? 'bg-indigo-600 scale-125' : answers[quiz.questions[idx].id] ? 'bg-indigo-200' : 'bg-gray-100'}`}
               ></button>
             ))}
          </div>

          <button 
            onClick={() => currentQuestionIdx < quiz.questions.length - 1 ? setCurrentQuestionIdx(currentQuestionIdx + 1) : finishQuiz()} 
            className="flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black hover:bg-black shadow-2xl transition-all active:scale-95 group"
          >
            {currentQuestionIdx === quiz.questions.length - 1 ? 'HOÀN TẤT' : 'KẾ TIẾP'} 
            <i className={`fas ${currentQuestionIdx === quiz.questions.length - 1 ? 'fa-check' : 'fa-arrow-right'} group-hover:translate-x-1 transition-transform`}></i>
          </button>
        </div>
      </div>
      
      {/* Question Selector Footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-max max-w-[90vw] flex gap-2 overflow-x-auto p-3 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-2xl no-scrollbar z-[100]">
        {quiz.questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentQuestionIdx(idx)}
            className={`w-10 h-10 rounded-xl font-black text-xs shrink-0 transition-all flex items-center justify-center border-2 ${
              idx === currentQuestionIdx ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-110' : answers[quiz.questions[idx].id] ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white text-gray-300 border-gray-50 hover:border-indigo-100'
            }`}
          >{idx + 1}</button>
        ))}
      </div>
    </div>
  );
};

export default QuizTake;
