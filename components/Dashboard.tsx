
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

  if (isAdmin) {
    const studentCount = accounts.filter(a => a.role === 'User').length;
    
    const adminStats = [
      { 
        label: 'Ngân hàng', 
        value: questions.length, 
        icon: 'fa-database', 
        color: 'text-blue-600', 
        bg: 'bg-blue-50', 
        path: '/bank',
        desc: 'Quản lý câu hỏi'
      },
      { 
        label: 'Bài thi', 
        value: quizzes.length, 
        icon: 'fa-clipboard-check', 
        color: 'text-green-600', 
        bg: 'bg-green-50', 
        path: '/quizzes',
        desc: 'Thiết lập đề thi'
      },
      { 
        label: 'Học viên', 
        value: studentCount, 
        icon: 'fa-users', 
        color: 'text-purple-600', 
        bg: 'bg-purple-50', 
        path: '/students',
        desc: 'Quản lý tiến độ'
      },
      { 
        label: 'Nhật ký', 
        value: results.length, 
        icon: 'fa-history', 
        color: 'text-orange-600', 
        bg: 'bg-orange-50', 
        path: '/history',
        desc: 'Lịch sử hệ thống'
      },
    ];

    return (
      <div className="space-y-6 md:space-y-10 animate-fadeIn px-1 md:px-0 pb-10">
        {/* Admin Header */}
        <div className="bg-indigo-900 rounded-[2.5rem] p-6 md:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="inline-block px-3 py-1 bg-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-indigo-400/20">
                Hệ thống Quản trị
              </div>
              <h1 className="text-3xl md:text-4xl font-black">Xin chào, {user.name.split(' ').pop()}!</h1>
              <p className="text-indigo-200 font-medium max-w-sm">Hệ thống của bạn đang có {questions.length} câu hỏi sẵn sàng.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link to="/upload" className="w-full bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 active:scale-95">
                <i className="fas fa-file-pdf"></i> Tải lên PDF
              </Link>
              <Link to="/manual-add" className="w-full bg-indigo-500/40 text-white border border-indigo-400/30 px-8 py-4 rounded-2xl font-black hover:bg-indigo-500/60 transition-all flex items-center justify-center gap-2 active:scale-95">
                <i className="fas fa-plus"></i> Thêm câu hỏi
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {adminStats.map((stat, idx) => (
            <Link 
              to={stat.path} 
              key={idx} 
              className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-center text-center md:text-left gap-3 md:gap-4 transition-all hover:scale-[1.03] hover:shadow-md hover:border-indigo-100 active:scale-95 group"
            >
              <div className={`${stat.bg} ${stat.color} w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl shrink-0 group-hover:scale-110 transition-transform`}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <div>
                <p className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{stat.value}</h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Management Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900">Bài thi mới tạo</h2>
            <Link to="/quizzes" className="text-indigo-600 font-black text-sm flex items-center gap-1">Tất cả bài thi <i className="fas fa-chevron-right text-[10px]"></i></Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-gray-400 font-bold mb-4 text-sm">Chưa có bài thi nào.</p>
              <Link to="/create-quiz" className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs">Tạo ngay</Link>
            </div>
          ) : (
            <div className="p-3 md:p-4 space-y-2">
              {quizzes.slice(0, 5).map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 line-clamp-1">{quiz.title}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{quiz.questions.length} câu • {quiz.durationMinutes} phút</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
                       className="w-9 h-9 rounded-xl text-gray-300 hover:text-indigo-600 transition-colors"
                     >
                       <i className="fas fa-edit"></i>
                     </button>
                     <button 
                       onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                       className="w-9 h-9 rounded-xl text-gray-300 hover:text-red-600 transition-colors"
                     >
                       <i className="fas fa-trash-alt"></i>
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // User View (Giữ nguyên hoặc cải tiến nhẹ nếu cần)
  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn px-1 md:px-0 pb-10">
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-0 opacity-50"></div>
        <div className="relative z-10 shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-100 to-indigo-50 border-4 border-white shadow-2xl flex items-center justify-center text-indigo-600 text-4xl md:text-5xl font-black rotate-3">
            {user.name.charAt(0)}
          </div>
        </div>
        <div className="flex-grow text-center md:text-left space-y-4 z-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Xin chào, {user.name}!</h1>
          <p className="text-gray-500 font-medium">Bạn đã học được {questions.filter(q => q.seenCount > 0).length} / {questions.length} câu hỏi.</p>
          <Link to="/learn" className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all inline-flex items-center justify-center gap-2 active:scale-95">
            <i className="fas fa-rocket"></i> Học ngay
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-gray-900">Bài thi dành cho bạn</h2>
          {quizzes.length === 0 ? (
            <div className="bg-white p-16 rounded-[2.5rem] text-center border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">Chưa có bài thi nào được giao.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map(quiz => (
                <Link key={quiz.id} to={`/quiz/${quiz.id}`} className="bg-white p-6 rounded-[2rem] border border-gray-50 hover:border-indigo-600 hover:shadow-2xl transition-all group active:scale-[0.98]">
                  <h3 className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{quiz.questions.length} câu hỏi • {quiz.durationMinutes} phút</p>
                  <div className="mt-8 flex items-center text-indigo-600 font-black text-xs gap-2">
                    Làm bài thi <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
