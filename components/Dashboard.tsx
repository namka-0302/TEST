
import React from 'react';
import { Link } from 'react-router-dom';
import { Question, Quiz, User } from '../types';

interface DashboardProps {
  user: User;
  questions: Question[];
  quizzes: Quiz[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, questions, quizzes }) => {
  const isAdmin = user.role === 'Admin';
  
  if (isAdmin) {
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
              <Link to="/upload" className="w-full bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                <i className="fas fa-file-pdf"></i> Tải lên PDF
              </Link>
              <Link to="/manual-add" className="w-full bg-indigo-500/40 text-white border border-indigo-400/30 px-8 py-4 rounded-2xl font-black hover:bg-indigo-500/60 transition-all flex items-center justify-center gap-2">
                <i className="fas fa-plus"></i> Thêm mới
              </Link>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Ngân hàng', value: questions.length, icon: 'fa-database', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Bài thi', value: quizzes.length, icon: 'fa-clipboard-check', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Học viên', value: '124', icon: 'fa-users', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Lượt thi', value: '450', icon: 'fa-history', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-center text-center md:text-left gap-3 md:gap-4 transition-transform hover:scale-[1.02]">
              <div className={`${stat.bg} ${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-lg md:text-xl shrink-0`}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <div>
                <p className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Management Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900">Bài thi mới tạo</h2>
            <Link to="/bank" className="text-indigo-600 font-black text-sm flex items-center gap-1">Toàn bộ <i className="fas fa-chevron-right text-[10px]"></i></Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-200">
                <i className="fas fa-inbox text-2xl"></i>
              </div>
              <p className="text-gray-400 font-bold mb-4 text-sm">Chưa có bài thi nào được tạo.</p>
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
                  <div className="hidden sm:flex gap-2">
                     <button className="w-9 h-9 rounded-xl text-gray-300 hover:text-indigo-600 transition-colors"><i className="fas fa-edit"></i></button>
                     <button className="w-9 h-9 rounded-xl text-gray-300 hover:text-red-600 transition-colors"><i className="fas fa-trash-alt"></i></button>
                  </div>
                  <i className="fas fa-chevron-right text-gray-200 sm:hidden"></i>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // User View
  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn px-1 md:px-0 pb-10">
      {/* User Header */}
      <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-0 opacity-50"></div>
        <div className="relative z-10 shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-100 to-indigo-50 border-4 border-white shadow-2xl flex items-center justify-center text-indigo-600 text-4xl md:text-5xl font-black rotate-3">
            {user.name.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-bolt"></i>
          </div>
        </div>
        <div className="flex-grow text-center md:text-left space-y-4 z-10">
          <div className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            Thành viên tích cực
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Xin chào, {user.name}!</h1>
          <p className="text-gray-500 font-medium max-w-md">
            Bạn đã khám phá được {questions.filter(q => q.seenCount > 0).length} trên tổng số {questions.length} câu hỏi.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
            <Link to="/learn" className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
              <i className="fas fa-rocket"></i> Học ngay
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Learning Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900">Bài thi dành cho bạn</h2>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{quizzes.length} bài thi</span>
          </div>
          {quizzes.length === 0 ? (
            <div className="bg-white p-16 rounded-[2.5rem] text-center border border-dashed border-gray-200">
              <div className="text-gray-100 text-5xl mb-4"><i className="fas fa-book-reader"></i></div>
              <p className="text-gray-400 font-bold">Chưa có bài thi nào được giao.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map(quiz => (
                <Link key={quiz.id} to={`/quiz/${quiz.id}`} className="bg-white p-6 rounded-[2rem] border border-gray-50 hover:border-indigo-600 hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 opacity-50"></div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <i className="fas fa-file-signature"></i>
                    </div>
                    <span className="text-[9px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-100">Hot</span>
                  </div>
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

        {/* User Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full"></div>
            <h3 className="font-black text-lg mb-8 tracking-tight">Thống kê cá nhân</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-3 items-end">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Độ phủ ngân hàng</span>
                  <span className="text-sm font-black text-indigo-400">{questions.length > 0 ? Math.round((questions.filter(q => q.seenCount > 0).length / questions.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${questions.length > 0 ? (questions.filter(q => q.seenCount > 0).length / questions.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-5 rounded-3xl text-center border border-gray-700/30">
                  <p className="text-3xl font-black">{questions.filter(q => q.seenCount > 0).length}</p>
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">Câu đã gặp</p>
                </div>
                <div className="bg-gray-800/50 p-5 rounded-3xl text-center border border-gray-700/30">
                  <p className="text-3xl font-black">0</p>
                  <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">Top điểm</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100/50 flex items-start gap-4">
            <div className="text-indigo-400 text-xl pt-1"><i className="fas fa-lightbulb"></i></div>
            <div>
              <h3 className="font-black text-indigo-900 text-sm mb-1 uppercase tracking-widest">Mẹo hôm nay</h3>
              <p className="text-xs text-indigo-700/70 font-medium leading-relaxed">
                Tập trung học các câu hỏi mức độ "Khó" vào buổi sáng để tối ưu bộ não của bạn!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
