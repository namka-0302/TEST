
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Question, Quiz, User, Account, QuizResult } from '../types';

interface DashboardProps {
  user: User;
  questions: Question[];
  quizzes: Quiz[];
  accounts: Account[];
  results: QuizResult[];
  userProgress?: Record<string, number>;
  onDeleteQuiz?: (id: string) => void;
  onManualSync?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, questions, quizzes, accounts, results, userProgress = {}, onDeleteQuiz, onManualSync }) => {
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

  // Logic tính toán thống kê cho User
  const studentStats = useMemo(() => {
    if (isAdmin) return null;
    
    const userResults = results.filter(r => r.userId === user.id).sort((a, b) => a.timestamp - b.timestamp);
    
    // TIẾN ĐỘ CÁ NHÂN: Chỉ tính những câu mà User hiện tại đã học
    const totalSeen = questions.filter(q => userProgress[q.id] > 0).length;
    const masteryRate = questions.length > 0 ? Math.round((totalSeen / questions.length) * 100) : 0;
    
    const avgScore = userResults.length > 0 
      ? Math.round(userResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / userResults.length * 100)
      : 0;

    const recentScores = userResults.slice(-5).map(r => ({
      score: Math.round((r.score / r.totalQuestions) * 100),
      date: new Date(r.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }));

    return { userResults, totalSeen, masteryRate, avgScore, recentScores };
  }, [isAdmin, results, user.id, questions, userProgress]);

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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                 <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                 Hệ thống Quản trị
              </div>
              <h1 className="text-3xl md:text-4xl font-black">Xin chào, {user.name.split(' ').pop()}!</h1>
              <p className="text-indigo-200 font-medium max-w-sm">Hệ thống đồng bộ Cloud đang hoạt động ổn định.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button onClick={onManualSync} className="w-full bg-indigo-500/40 text-white border border-indigo-400/30 px-6 py-4 rounded-2xl font-black hover:bg-indigo-500/60 transition-all flex items-center justify-center gap-2">
                <i className="fas fa-sync-alt"></i> Làm mới dữ liệu
              </button>
              <Link to="/upload" className="w-full bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                <i className="fas fa-file-pdf"></i> Tải PDF/Word
              </Link>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {adminStats.map((stat, idx) => (
            <Link to={stat.path} key={idx} className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-all hover:scale-[1.03] group">
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

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900">Bài thi mới tạo</h2>
            <Link to="/quizzes" className="text-indigo-600 font-black text-sm flex items-center gap-1">Xem tất cả</Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="p-16 text-center text-gray-400 italic font-medium">Chưa có bài thi nào được tạo trên Cloud.</div>
          ) : (
            <div className="p-3 md:p-4 space-y-2">
              {quizzes.slice(0, 5).map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 line-clamp-1">{quiz.title}</h4>
                      <p className="text-[9px] font-black text-gray-400 uppercase">{quiz.questions.length} câu • {quiz.durationMinutes} phút</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => navigate(`/edit-quiz/${quiz.id}`)} className="text-gray-300 hover:text-indigo-600 p-2"><i className="fas fa-edit"></i></button>
                     <button onClick={() => handleDeleteQuiz(quiz.id, quiz.title)} className="text-gray-300 hover:text-red-600 p-2"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // USER VIEW (Học viên)
  if (!studentStats) return null;
  const { userResults, totalSeen, masteryRate, avgScore, recentScores } = studentStats;

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn px-1 md:px-0 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-indigo-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[240px]">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Chào {user.name.split(' ').pop()}! 👋</h1>
            <p className="text-indigo-200 font-medium">Kho câu hỏi hiện có <span className="text-white font-black">{questions.length}</span> nội dung học tập.</p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3 mt-8">
            <Link to="/learn" className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2 active:scale-95">
              <i className="fas fa-rocket"></i> HỌC NGAY
            </Link>
            <button onClick={onManualSync} className="bg-white/10 text-white border border-white/20 px-6 py-4 rounded-2xl font-black hover:bg-white/20 transition-all flex items-center gap-2">
              <i className="fas fa-sync-alt"></i> Đồng bộ lại
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full -rotate-90">
              <circle className="text-gray-100" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
              <circle className="text-indigo-600 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={364} strokeDashoffset={364 - (364 * masteryRate / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-gray-900">{masteryRate}%</span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Mastery</span>
            </div>
          </div>
          <h3 className="font-black text-gray-800 text-lg">Độ thuộc bài</h3>
          <p className="text-gray-400 text-xs mt-1 font-medium">Bạn đã thuộc {totalSeen} / {questions.length} câu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
            <i className="fas fa-star"></i>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Điểm trung bình</p>
            <h4 className="text-xl font-black text-gray-900">{avgScore}%</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <i className="fas fa-tasks"></i>
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bài thi đã làm</p>
            <h4 className="text-xl font-black text-gray-900">{userResults.length} bài</h4>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Xu hướng 5 bài gần nhất</p>
          <div className="flex items-end justify-between h-16 gap-2">
            {recentScores.length === 0 ? (
              <p className="text-gray-300 text-[10px] w-full text-center pb-2 italic font-medium">Chưa có dữ liệu thi.</p>
            ) : (
              recentScores.map((s, i) => (
                <div key={i} className="flex-grow flex flex-col items-center gap-2 group">
                  <div className="w-full bg-indigo-50 rounded-t-lg relative overflow-hidden h-full flex items-end">
                     <div 
                      className="bg-indigo-500 w-full transition-all duration-1000 group-hover:bg-indigo-600" 
                      style={{ height: `${s.score}%` }}
                     ></div>
                     <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-black text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                       {s.score}%
                     </span>
                  </div>
                  <span className="text-[8px] font-bold text-gray-400">{s.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
