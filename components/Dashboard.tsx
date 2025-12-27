
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
      <div className="space-y-8 animate-fadeIn">
        {/* Admin Header */}
        <div className="bg-indigo-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black">Admin Portal</h1>
              <p className="text-indigo-200">Chào {user.name}, hệ thống đang hoạt động ổn định.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/upload" className="bg-white text-indigo-900 px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2">
                <i className="fas fa-file-pdf"></i> Import PDF
              </Link>
              <Link to="/manual-add" className="bg-indigo-500/30 text-white border border-indigo-400/50 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-500/50 transition-all flex items-center gap-2">
                <i className="fas fa-plus"></i> Thêm Thủ Công
              </Link>
            </div>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Tổng Câu Hỏi', value: questions.length, icon: 'fa-database', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Bài Thi Đang Có', value: quizzes.length, icon: 'fa-clipboard-check', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Tỷ Lệ Hoàn Thành', value: '0%', icon: 'fa-chart-pie', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Yêu Cầu Hỗ Trợ', value: '0', icon: 'fa-headset', color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`${stat.bg} ${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-xl`}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Management Table */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Danh Sách Bài Thi Mới Nhất</h2>
            <Link to="/bank" className="text-indigo-600 font-bold text-sm">Xem Ngân Hàng <i className="fas fa-arrow-right ml-1"></i></Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="p-20 text-center text-gray-400">
              <i className="fas fa-inbox text-5xl mb-4 text-gray-100"></i>
              <p>Chưa có bài thi nào được tạo.</p>
              <Link to="/create-quiz" className="mt-4 inline-block text-indigo-600 font-bold">Tạo bài thi ngay</Link>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {quizzes.slice(0, 5).map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{quiz.title}</h4>
                      <p className="text-xs text-gray-400">{quiz.questions.length} câu hỏi • {quiz.durationMinutes} phút</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-2 text-gray-400 hover:text-indigo-600"><i className="fas fa-edit"></i></button>
                     <button className="p-2 text-gray-400 hover:text-red-600"><i className="fas fa-trash-alt"></i></button>
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
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* User Header */}
      <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-indigo-100 border-4 border-white shadow-xl flex items-center justify-center text-indigo-600 text-5xl font-black">
            {user.name.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white text-xs">
            <i className="fas fa-check"></i>
          </div>
        </div>
        <div className="flex-grow text-center md:text-left space-y-4">
          <div className="inline-block px-4 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
            Học viên năng nổ
          </div>
          <h1 className="text-4xl font-black text-gray-900">Xin chào, {user.name}!</h1>
          <p className="text-gray-500 max-w-lg">
            Hôm nay là một ngày tuyệt vời để học thêm điều mới. Bạn đã xem qua {questions.filter(q => q.seenCount > 0).length} câu hỏi.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <Link to="/learn" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
              Bắt đầu Học Tập
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Progress */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Bài thi được giao</h2>
          {quizzes.length === 0 ? (
            <div className="bg-white p-20 rounded-[2rem] text-center border border-dashed border-gray-200">
              <p className="text-gray-400">Bạn chưa có bài thi nào được giao hôm nay.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map(quiz => (
                <Link key={quiz.id} to={`/quiz/${quiz.id}`} className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-indigo-600 hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <i className="fas fa-feather-alt"></i>
                    </div>
                    <span className="text-[10px] font-black bg-gray-50 text-gray-400 px-2 py-1 rounded-full uppercase">Mới</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{quiz.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{quiz.questions.length} câu hỏi • {quiz.durationMinutes} phút</p>
                  <div className="mt-6 flex items-center text-indigo-600 font-bold text-sm">
                    Làm bài ngay <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* User Sidebar Stats */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-8 rounded-[2rem] shadow-xl">
            <h3 className="font-bold text-lg mb-6">Tiến trình học tập</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-gray-400 font-bold uppercase">Độ phủ câu hỏi</span>
                  <span className="text-xs font-bold">{questions.length > 0 ? Math.round((questions.filter(q => q.seenCount > 0).length / questions.length) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${questions.length > 0 ? (questions.filter(q => q.seenCount > 0).length / questions.length) * 100 : 0}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-2xl text-center">
                  <p className="text-2xl font-black">{questions.filter(q => q.seenCount > 0).length}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Đã gặp</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-2xl text-center">
                  <p className="text-2xl font-black">0</p>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Thành tích</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
            <h3 className="font-bold text-indigo-900 mb-2">Mẹo học tập</h3>
            <p className="text-sm text-indigo-700/70">
              Hãy thử làm bài quiz ít nhất 15 phút mỗi ngày để tăng khả năng ghi nhớ dài hạn!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
