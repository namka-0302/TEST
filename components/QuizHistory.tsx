
import React from 'react';
import { Link } from 'react-router-dom';
import { QuizResult, User } from '../types';

interface QuizHistoryProps {
  user: User;
  results: QuizResult[];
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ user, results }) => {
  const myResults = results
    .filter(r => r.userId === user.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn px-2 sm:px-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lịch sử làm bài</h1>
        <p className="text-slate-500 font-medium">Bạn đã hoàn thành tổng cộng <span className="text-indigo-600 font-black">{myResults.length}</span> lượt thi trắc nghiệm.</p>
      </div>

      {myResults.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
           <i className="fas fa-clipboard-question text-slate-100 text-7xl mb-6"></i>
           <h3 className="text-xl font-black text-slate-900">Chưa có bài thi nào</h3>
           <p className="text-slate-400 font-medium max-w-sm mt-2">Hãy bắt đầu bài thi đầu tiên để theo dõi sự tiến bộ của bản thân.</p>
           <Link to="/" className="mt-8 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100">VỀ TRANG CHỦ</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myResults.map((res, idx) => {
            const scoreRate = res.score / res.totalQuestions;
            const percentage = Math.round(scoreRate * 100);
            const isMock = res.quizId.startsWith('mock-');

            return (
              <div key={idx} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-xl hover:border-indigo-100">
                <div className="flex items-center gap-5 w-full sm:w-auto">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                     isMock ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                   }`}>
                      <i className={`fas ${isMock ? 'fa-vial' : 'fa-file-invoice'}`}></i>
                   </div>
                   <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 text-lg line-clamp-1">{res.quizTitle || 'Bài thi trắc nghiệm'}</h4>
                        {isMock && <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Thi thử</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(res.timestamp)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TG: {formatTime(res.timeSpent)}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                  <div className="text-right">
                    <p className={`text-2xl font-black leading-none ${
                      percentage >= 80 ? 'text-emerald-600' : percentage >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>{res.score}/{res.totalQuestions}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1">Đạt {percentage}%</p>
                  </div>
                  <div className="h-10 w-px bg-slate-100 hidden sm:block"></div>
                  <Link 
                    to={`/quiz-review/${res.quizId}`} 
                    className="flex-grow sm:flex-grow-0 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    XEM LẠI <i className="fas fa-chevron-right text-[10px]"></i>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizHistory;
