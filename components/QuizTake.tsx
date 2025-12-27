
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

  if (!quiz) return <div className="text-center py-20">Quiz not found.</div>;

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
        <div className="max-w-4xl mx-auto animate-fadeIn space-y-8 pb-20">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between sticky top-20 z-20">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review: {quiz.title}</h2>
              <p className="text-sm text-indigo-600 font-bold">Your Score: {result.score} / {result.totalQuestions}</p>
            </div>
            <button 
              onClick={() => setShowReview(false)}
              className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold"
            >
              Back to Result
            </button>
          </div>

          <div className="space-y-6">
            {quiz.questions.map((q, idx) => {
              const selectedId = result.answers[q.id];
              const correctChoice = q.choices.find(c => c.isCorrect);
              const isCorrect = selectedId === correctChoice?.id;

              return (
                <div key={q.id} className={`p-8 rounded-3xl bg-white border shadow-sm ${isCorrect ? 'border-green-100' : 'border-red-100'}`}>
                  <div className="flex justify-between mb-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-6">{idx + 1}. {q.text}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.choices.map(c => {
                      const isOptionSelected = selectedId === c.id;
                      const isOptionCorrect = c.isCorrect;
                      
                      let choiceClasses = 'bg-gray-50 border-gray-100 opacity-60';
                      if (isOptionCorrect) choiceClasses = 'bg-green-50 border-green-600 text-green-800';
                      else if (isOptionSelected) choiceClasses = 'bg-red-50 border-red-600 text-red-800';

                      return (
                        <div key={c.id} className={`p-4 rounded-2xl border-2 flex items-center gap-3 ${choiceClasses}`}>
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isOptionCorrect ? 'bg-green-600 text-white' : isOptionSelected ? 'bg-red-600 text-white' : 'bg-white text-gray-400'
                          }`}>
                            {c.label}
                          </span>
                          <span className="font-semibold text-sm">{c.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Explanation</p>
                      <p className="text-sm text-indigo-900 italic">{q.explanation}</p>
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
      <div className="max-w-2xl mx-auto animate-fadeIn space-y-8">
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-xl text-center space-y-6">
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto text-white text-4xl shadow-lg shadow-indigo-100">
            <i className="fas fa-check"></i>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Quiz Completed!</h2>
            <p className="text-gray-500 mt-1">Assessment finalized for {quiz.title}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Score</p>
              <h4 className="text-2xl font-bold text-indigo-600">{result.score} / {result.totalQuestions}</h4>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Grade</p>
              <h4 className="text-2xl font-bold text-green-600">{Math.round((result.score / result.totalQuestions) * 100)}%</h4>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-bold text-gray-400 uppercase">Time</p>
              <h4 className="text-2xl font-bold text-gray-700">{formatTime(result.timeSpent)}</h4>
            </div>
          </div>

          <div className="pt-8 flex flex-col gap-3">
            <button 
              onClick={() => setShowReview(true)}
              className="w-full bg-white text-indigo-600 border border-indigo-100 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all"
            >
              Review Detailed Answers
            </button>
            <Link to="/" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-20 z-10 gap-4">
        <div>
          <h2 className="font-bold text-gray-900">{quiz.title}</h2>
          <p className="text-xs text-gray-400">Question {currentQuestionIdx + 1} of {quiz.questions.length}</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <i className="fas fa-clock text-indigo-600"></i>
            <span className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={finishQuiz}
            className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800"
          >
            Submit
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
        <div className="space-y-4">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Question {currentQuestionIdx + 1}</span>
          <h3 className="text-2xl font-bold text-gray-800 leading-tight">
            {currentQuestion.text}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.choices.map((choice) => (
            <div 
              key={choice.id}
              onClick={() => selectAnswer(currentQuestion.id, choice.id)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 group ${
                answers[currentQuestion.id] === choice.id 
                ? 'border-indigo-600 bg-indigo-50/50' 
                : 'border-gray-50 bg-gray-50 hover:border-gray-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 transition-colors ${
                answers[currentQuestion.id] === choice.id 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-400 border border-gray-200 group-hover:bg-indigo-100 group-hover:text-indigo-600'
              }`}>
                {choice.label}
              </div>
              <span className={`text-lg font-medium ${
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

        <div className="flex justify-between pt-8 border-t border-gray-50">
          <button 
            onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
            disabled={currentQuestionIdx === 0}
            className="flex items-center gap-2 text-gray-400 font-bold hover:text-indigo-600 disabled:opacity-0"
          >
            <i className="fas fa-arrow-left"></i> Previous
          </button>
          
          <button 
            onClick={() => {
              if (currentQuestionIdx < quiz.questions.length - 1) {
                setCurrentQuestionIdx(currentQuestionIdx + 1);
              } else {
                finishQuiz();
              }
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          >
            {currentQuestionIdx === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'} 
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {quiz.questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentQuestionIdx(idx)}
            className={`w-10 h-10 rounded-lg font-bold text-sm transition-all border ${
              idx === currentQuestionIdx 
                ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-md' 
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
