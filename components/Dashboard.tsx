
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Question, Quiz, User, Account, QuizResult } from '../types';

interface DashboardProps {
  user: User;
  questions: Question[];
  quizzes: Quiz[];
  accounts: Account[];
  results: QuizResult[];
  onDeleteQuiz?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, questions, quizzes, accounts, results, onDeleteQuiz }) => {
  const isAdmin = user.role === 'Admin';
  const navigate = useNavigate();
  
  const handleDeleteQuiz = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài thi "${title}" không?`)) {
      onDeleteQuiz?.(id);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isAdmin) {
    const studentCount = accounts.filter(a => a.role === 'User').length;
    const adminStats = [
      { label: 'Ngân hàng', value: questions.length, icon: 'fa-database', color: 'text-blue-600', bg: 'bg-blue-50', path: '/bank' },
      { label: 'Bài thi', value: quizzes.length, icon: 'fa-clipboard-check', color: 'text-green-600', bg: 'bg-green-50', path: '/quizzes' },
      { label: 'Học viên', value: studentCount, icon: 'fa-users', color: 'text-purple-600', bg: 'bg-purple-50', path: '/students' },
      { label: 'Nhật ký', value: results.length, icon: 'fa-history', color: 'text-orange-600', bg: 'bg-orange-50', path: '/history' },
    ];

    return (
      <div className="space-y-6 md:space-y-10 animate-fadeIn px-1 md:px-0 pb-10">
        <div className="bg-indigo-900 rounded-[2.5rem] p-6 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 bg-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">Hệ thống Quản trị</div>
              <h1 className="text-3xl md:text-4xl font-black">Xin chào, {user.name.split(' ').pop()}!</h1>
              <p className="text-indigo-200 font-medium max-w-sm">Hệ thống đang sẵn sàng cho kỳ thi mới.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link to="/upload" className="w-full bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                <i className="fas fa-file-pdf"></i> Tải PDF/Word
              </Link>
              <Link to="/manual-add" className="w-full bg-indigo-500/40 text-white border border-indigo-400/30 px-8 py-4 rounded-2xl font-black hover:bg-indigo-500/60 transition-all flex items-center justify-center gap-2">
                <i className="fas fa-plus"></i> Thêm câu hỏi
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {adminStats.map((stat, idx) => (
            <Link to={stat.path} key={idx} className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-all hover:scale-[1.03] group">
              <div className={`${stat.bg} ${stat.color} w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl shrink-0 group-hover:scale-110`}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <div>
                <p className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{stat.value}</h3>
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900">Bài thi mới tạo</h2>
            <Link to="/quizzes" className="text-indigo-600 font-black text-sm flex items-center gap-1">Xem tất cả</Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="p-16 text-center text-gray-400">Chưa có bài thi nào.</div>
          ) : (
            <div className="p-3 md:p-4 space-y-2">
              {quizzes.slice(0, 5).map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 line-clamp-1">{quiz.title}</h4>
                      <p className="text-[9px] font-black text-gray-400 uppercase">{quiz.questions.length} câu • {quiz.durationMinutes} phút</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => navigate(`/edit-quiz/${quiz.id}`)} className="text-gray-300 hover:text-indigo-600"><i className="fas fa-edit"></i></button>
                     <button onClick={() => handleDeleteQuiz(quiz.id, quiz.title)} className="text-gray-300 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // User View
  const userResults = results.filter(r => r.userId === user.id);
  const totalSeen = questions.filter(q => q.seenCount > 0).length;

  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn px-1 md:px-0 pb-10">
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden">
        <div className="relative z-10 shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl flex items-center justify-center text-4xl md:text-5xl font-black">
            {user.name.charAt(0)}
          </div>
        </div>
        <div className="flex-grow text-center md:text-left space-y-4 z-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Chào mừng, {user.name}!</h1>
          <p className="text-gray-500 font-medium">Bạn đã hoàn thành {totalSeen} / {questions.length} câu hỏi kiến thức.</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <Link to="/learn" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
              <i className="fas fa-rocket"></i> Học ngay
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-gray-900">Bài thi được giao</h2>
          {quizzes.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] text-center border border-dashed border-gray-200">Chưa có bài thi nào.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map(quiz => (
                <Link key={quiz.id} to={`/quiz/${quiz.id}`} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 hover:border-indigo-600 hover:shadow-xl transition-all group">
                  <h3 className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-indigo-600">{quiz.title}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{quiz.questions.length} câu • {quiz.durationMinutes} phút</p>
                  <div className="mt-6 text-indigo-600 font-black text-xs flex items-center gap-2">
                    Bắt đầu làm bài <i className="fas fa-arrow-right"></i>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
           <h2 className="text-xl font-black text-gray-900">Lịch sử của bạn</h2>
           <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
             {userResults.length === 0 ? (
               <div className="p-10 text-center text-gray-400 text-sm">Bạn chưa thực hiện bài thi nào.</div>
             ) : (
               <div className="divide-y divide-gray-50">
                 {userResults.slice(0, 5).map((res, idx) => (
                   <div key={idx} className="p-5 hover:bg-gray-50 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{res.quizTitle || 'Bài kiểm tra'}</h4>
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded ${res.score/res.totalQuestions >= 0.8 ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                         {Math.round(res.score/res.totalQuestions*100)}%
                       </span>
                     </div>
                     <div className="flex justify-between items-center">
                       <p className="text-[9px] text-gray-400 font-black uppercase">{new Date(res.timestamp).toLocaleDateString()} • {formatTime(res.timeSpent)}</p>
                       <Link 
                          to={`/quiz-review/${res.quizId}?timestamp=${res.timestamp}`} 
                          className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter hover:underline"
                       >
                         Xem lại bài <i className="fas fa-chevron-right text-[7px]"></i>
                       </Link>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
