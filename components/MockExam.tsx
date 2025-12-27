
import React, { useState, useEffect, useMemo } from 'react';
import { Question, Quiz, QuizResult, User } from '../types';
import QuizTake from './QuizTake';

interface MockExamProps {
  questions: Question[];
  user: User;
  onComplete: (questionIds: string[], result: QuizResult) => void;
}

const MockExam: React.FC<MockExamProps> = ({ questions, user, onComplete }) => {
  const [mockQuiz, setMockQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (questions.length === 0) return;

    // Shuffle and pick 30 random questions (updated from 20 as requested)
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 30);

    const generatedQuiz: Quiz = {
      id: 'mock-' + Date.now(),
      title: 'Thi thử ngẫu nhiên hệ thống',
      questions: selectedQuestions,
      durationMinutes: 30, // Default 30 minutes
      createdAt: Date.now()
    };

    setMockQuiz(generatedQuiz);
  }, [questions]);

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center bg-white rounded-[3rem] border border-gray-100 shadow-xl mt-10 px-6">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl">
          <i className="fas fa-sync-alt fa-spin"></i>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Đang chuẩn bị đề thi...</h2>
        <p className="text-gray-400 mt-2 font-medium">Hệ thống đang trích xuất câu hỏi ngẫu nhiên từ ngân hàng.</p>
      </div>
    );
  }

  if (!mockQuiz) return null;

  return (
    <div className="animate-fadeIn">
      <div className="max-w-5xl mx-auto px-4 mb-4">
         <div className="bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
               <i className="fas fa-vial"></i>
               <span className="font-black text-sm uppercase tracking-widest">Chế độ thi thử ngẫu nhiên</span>
            </div>
            <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full">30 PHÚT • 30 CÂU HỎI</span>
         </div>
      </div>
      <QuizTake 
        quizzes={[mockQuiz]} 
        user={user} 
        onComplete={onComplete} 
      />
    </div>
  );
};

export default MockExam;
