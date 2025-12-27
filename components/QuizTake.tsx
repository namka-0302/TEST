
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Quiz, QuizResult } from '../types';

interface QuizTakeProps {
  quizzes: Quiz[];
  onComplete: (questionIds: string[]) => void;
}

const QuizTake: React.FC<QuizTakeProps> = ({ quizzes, onComplete }) => {
  const { id } = useParams<{ id: string }>();
  const quiz = quizzes.find(q => q.id === id);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(quiz ? quiz.durationMinutes * 60 : 0);
  const [isFinished, setIsFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;
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
  }, [isFinished, timeLeft]);

  const selectAnswer = (questionId: string, choiceId: string) => {
    if (isFinished) return;
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

    setResult({
      score,
      totalQuestions: quiz.questions.length,
      timeSpent: quiz.durationMinutes * 60 - timeLeft,
      answers,
      quizId: quiz.id,
      timestamp: Date.now()
    });
    setIsFinished(true);
    onComplete(quiz.questions.map(q => q.id));
  }, [quiz, answers, timeLeft, isFinished, onComplete]);

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
        <div className="max-w-4xl mx-auto animate-fadeIn space-y-6 pb-20 px-2">
          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-center justify-between sticky top-20 z-50 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-lg font-black text-gray-900">Xem lại bài thi</h2>
              <p className="text-sm text-indigo-600 font-black">Kết quả: {result.score} / {result.totalQuestions}</p>
            </div>
            <button 
              onClick={() => setShowReview(false)}
              className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl"
            >
              Quay lại kết quả
            </button>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((q, idx) => {
              const selectedId = result.answers[q.id];
              const correctChoice = q.choices.find(c => c.isCorrect);
              const isCorrect = selectedId === correctChoice?.id;

              return (
                <div key={q.id} className={`p-6 md:p-8 rounded-[2rem] bg-white border shadow-sm ${isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                  <div className="flex justify-between mb-4">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {isCorrect ? 'Chính xác' : 'Sai rồi'}
                    </span>
                    <span className="text-xs font-black text-gray-300">#{idx + 1}</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-6 leading-snug">{q.text}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.choices.map(c => {
                      const isOptionSelected = selectedId === c.id;
                      const isOptionCorrect = c.isCorrect;
                      
                      let choiceClasses = 'bg-gray-50 border-gray-50 opacity-60';
                      if (isOptionCorrect) choiceClasses = 'bg-green-50 border-green-600 text-green-800 scale-[1.01] shadow-sm z-10';
                      else if (isOptionSelected) choiceClasses = 'bg-red-50 border-red-600 text-red-800';

                      return (
                        <div key={c.id} className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${choiceClasses}`}>
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            isOptionCorrect ? 'bg-green-600 text-white' : isOptionSelected ? 'bg-red-600 text-white' : 'bg-white text-gray-400'
                          }`}>
                            {c.label}
                          </span>
                          <span className="font-bold text-sm">{c.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-600 uppercase mb-2 tracking-widest">Giải thích chi tiết</p>
                      <p className="text-sm text-indigo-900 font-medium italic">{q.explanation}</p>
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
      <div className="max-w-2xl mx-auto animate-fadeIn px-2">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-2xl text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-white text-4xl shadow-2xl rotate-3">
            <i className="fas fa-trophy"></i>
          </div>
          
          <div>
            <h2 className="text-3xl font-black text-gray-900">Hoàn tất bài thi!</h2>
            <p className="text-gray-500 mt-2 font-medium">Bạn đã hoàn thành bài thi: <span className="text-indigo-600">{quiz.title}</span></p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Điểm số</p>
              <h4 className="text-2xl font-black text-indigo-700">{result.score} / {result.totalQuestions}</h4>
            </div>
            <div className="p-5 bg-green-50 rounded-3xl border border-green-100">
              <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Tỷ lệ</p>
              <h4 className="text-2xl font-black text-green-700">{Math.round((result.score / result.totalQuestions) * 100)}%</h4>
            </div>
            <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Thời gian</p>
              <h4 className="text-2xl font-black text-gray-700">{formatTime(result.timeSpent)}</h4>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <button 
              onClick={() => setShowReview(true)}
              className="w-full bg-white text-indigo-600 border-2 border-indigo-100 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-sm"
            >
              Xem đáp án chi tiết
            </button>
            <Link to="/" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200">
              Về Trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn space-y-4 px-1 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm sticky top-[4.5rem] z-50 gap-4">
        <div className="text-center md:text-left">
          <h2 className="font-black text-gray-900 line-clamp-1">{quiz.title}</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Câu {currentQuestionIdx + 1} / {quiz.questions.length}</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex-grow md:flex-grow-0 flex items-center justify-center gap-3 bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100">
            <i className="fas fa-clock text-indigo-600"></i>
            <span className={`font-mono text-xl font-black ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={finishQuiz}
            className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-black shadow-lg"
          >
            Nộp bài
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mx-auto max-w-[95%]">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-50 shadow-xl space-y-10 min-h-[500px] flex flex-col">
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            Câu hỏi {currentQuestionIdx + 1}
          </div>
          <h3 className="text-xl md:text-2xl font-black text-gray-800 leading-snug">
            {currentQuestion.text}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.choices.map((choice) => (
            <div 
              key={choice.id}
              onClick={() => selectAnswer(currentQuestion.id, choice.id)}
              className={`p-5 md:p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 group ${
                answers[currentQuestion.id] === choice.id 
                ? 'border-indigo-600 bg-indigo-50/50' 
                : 'border-gray-50 bg-gray-50 hover:border-gray-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 transition-colors ${
                answers[currentQuestion.id] === choice.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white text-gray-400 border border-gray-100 group-hover:text-indigo-600'
              }`}>
                {choice.label}
              </div>
              <span className={`text-base md:text-lg font-bold leading-tight ${
                answers[currentQuestion.id] === choice.id ? 'text-indigo-900' : 'text-gray-700'
              }`}>
                {choice.text}
              </span>
              <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                answers[currentQuestion.id] === choice.id ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
              }`}>
                {answers[currentQuestion.id] === choice.id && <i className="fas fa-check text-[10px] text-white"></i>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto flex justify-between pt-10 border-t border-gray-50">
          <button 
            onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
            disabled={currentQuestionIdx === 0}
            className="flex items-center gap-2 text-gray-400 font-black hover:text-indigo-600 disabled:opacity-0 transition-all"
          >
            <i className="fas fa-chevron-left"></i> Câu trước
          </button>
          
          <button 
            onClick={() => {
              if (currentQuestionIdx < quiz.questions.length - 1) {
                setCurrentQuestionIdx(currentQuestionIdx + 1);
              } else {
                finishQuiz();
              }
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
          >
            {currentQuestionIdx === quiz.questions.length - 1 ? 'Hoàn tất' : 'Câu tiếp theo'} 
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      {/* Question Tracker - Horizontally Scrollable on Mobile */}
      <div className="flex gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar px-2 mask-linear-right">
        {quiz.questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentQuestionIdx(idx)}
            className={`w-12 h-12 rounded-2xl font-black text-sm shrink-0 transition-all border-2 ${
              idx === currentQuestionIdx 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-110' 
                : answers[quiz.questions[idx].id] 
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-200'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizTake;
