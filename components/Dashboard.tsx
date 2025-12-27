
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

  // Tính toán bảng xếp hạng
  const leaderboard = useMemo(() => {
    const students = accounts.filter(a => a.role === 'User');
    const rankings = students.map(s => {
      const studentResults = results.filter(r => r.userId === s.id);
      const totalPoints = studentResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0);
      const avgScore = studentResults.length > 0 ? Math.round(totalPoints / studentResults.length) : 0;
      return { id: s.id, name: s.name, avgScore, count: studentResults.length };
    }).sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);
    return rankings;
  }, [accounts, results]);

  const studentStats = useMemo(() => {
    if (isAdmin) return null;
    const userResults = results.filter(r => r.userId === user.id).sort((a, b) => b.timestamp - a.timestamp);
    const totalSeen = questions.filter(q => userProgress[q.id] > 0).length;
    const masteryRate = questions.length > 0 ? Math.round((totalSeen / questions.length) * 100) : 0;
    const avgScore = userResults.length > 0 
      ? Math.round(userResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / userResults.length * 100)
      : 0;
    return { userResults, totalSeen, masteryRate, avgScore };
  }, [isAdmin, results, user.id, questions, userProgress]);

  if (isAdmin) {
    const adminStats = [
      { label: 'Ngân hàng', value: questions.length, icon: 'fa-database', color: 'text-blue-600', bg: 'bg-blue-50', path: '/bank' },
      { label: 'Bài thi', value: quizzes.length, icon: 'fa-clipboard-check', color: 'text-green-600', bg: 'bg-green-50', path: '/quizzes' },
      { label: 'Học viên', value: accounts.filter(a => a.role === 'User').length, icon: 'fa-users', color: 'text-purple-600', bg: 'bg-purple-50', path: '/students' },
      { label: 'Nhật ký', value: results.length, icon: 'fa-history', color: 'text-orange-600', bg: 'bg-orange-50', path: '/history' },
    ];

    return (
      <div className="space-y-10 animate-fadeIn px-1 pb-10">
        <div className="bg-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-black">Hệ thống Quản trị AI</h1>
              <p className="text-indigo-200 font-medium">Chào mừng {user.name}, chúc bạn một ngày làm việc hiệu quả!</p>
            </div>
            <div className="flex gap-4">
              <button onClick={onManualSync} className="bg-white/10 px-8 py-4 rounded-2xl font-black hover:bg-white/20 transition-all">ĐỒNG BỘ CLOUD</button>
              <Link to="/upload" className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-50">TẠO HỌC LIỆU AI</Link>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {adminStats.map((stat, idx) => (
            <Link to={stat.path} key={idx} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.03]">
              <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0`}><i className={`fas ${stat.icon}`}></i></div>
              <div><p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p><h3 className="text-2xl font-black text-gray-900">{stat.value}</h3></div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center"><h2 className="text-xl font-black text-gray-900">Bài thi mới cập nhật</h2><Link to="/quizzes" className="text-indigo-600 font-black text-sm">Quản lý</Link></div>
              <div className="p-4 space-y-2">{quizzes.slice(0, 5).map(quiz => (
                <div key={quiz.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 group">
                  <div className="flex items-center gap-4"><div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:text-indigo-600 transition-colors"><i className="fas fa-file-alt"></i></div><div><h4 className="font-bold text-gray-800 line-clamp-1">{quiz.title}</h4><p className="text-[9px] font-black text-gray-400 uppercase">{quiz.questions.length} câu • {quiz.durationMinutes} phút</p></div></div>
                  <button onClick={() => handleDeleteQuiz(quiz.id, quiz.title)} className="text-gray-200 hover:text-red-500 p-2"><i className="fas fa-trash"></i></button>
                </div>
              ))}</div>
           </div>
           {/* Leaderboard for Admin */}
           <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><i className="fas fa-trophy text-yellow-500"></i> Bảng vàng danh dự</h2>
              <div className="space-y-4">
                {leaderboard.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50/50 border border-gray-50">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${i===0?'bg-yellow-500 text-white':i===1?'bg-gray-400 text-white':i===2?'bg-orange-400 text-white':'bg-white text-gray-400 border'}`}>{i+1}</div>
                    <div className="flex-grow"><p className="font-black text-gray-800 text-sm line-clamp-1">{s.name}</p><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{s.count} bài thi</p></div>
                    <div className="text-right"><p className="text-lg font-black text-indigo-600">{s.avgScore}%</p></div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // USER VIEW
  if (!studentStats) return null;
  const { totalSeen, masteryRate, avgScore } = studentStats;

  return (
    <div className="space-y-8 animate-fadeIn px-1 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="relative z-10">
            <h1 className="text-5xl font-black tracking-tight mb-3">Chào {user.name.split(' ').pop()}!</h1>
            <p className="text-indigo-200 font-medium text-lg">Bạn đã thuộc <span className="text-white font-black">{totalSeen}</span> trên tổng số {questions.length} câu hỏi. Đạt tỉ lệ ghi nhớ {masteryRate}%.</p>
          </div>
          <div className="relative z-10 flex gap-4 mt-8">
            <Link to="/learn" className="bg-white text-indigo-900 px-10 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 text-base">CHẾ ĐỘ ÔN TẬP</Link>
            <button onClick={onManualSync} className="bg-white/10 text-white border border-white/20 px-8 py-5 rounded-[2rem] font-black hover:bg-white/20 transition-all">CẬP NHẬT DỮ LIỆU</button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl">
           <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><i className="fas fa-trophy text-yellow-500"></i> Bảng vàng vinh danh</h2>
           <div className="space-y-3">
             {leaderboard.map((s, i) => (
               <div key={s.id} className={`flex items-center gap-4 p-4 rounded-2xl ${s.id === user.id ? 'bg-indigo-50 border border-indigo-100 scale-105 shadow-md' : 'bg-gray-50/50 border border-transparent'}`}>
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${i===0?'bg-yellow-500 text-white':i===1?'bg-gray-400 text-white':i===2?'bg-orange-400 text-white':'bg-white text-gray-300'}`}>{i+1}</div>
                 <div className="flex-grow overflow-hidden"><p className="font-black text-gray-800 text-xs line-clamp-1">{s.name}</p></div>
                 <div className="font-black text-indigo-600 text-sm">{s.avgScore}%</div>
               </div>
             ))}
           </div>
           <p className="text-center text-[9px] font-black text-gray-300 uppercase mt-6 tracking-widest">Thi càng nhiều, điểm càng cao để lên Top!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 px-2">Kỳ thi từ Giáo viên <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full">{quizzes.length}</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes.map(quiz => (
              <Link to={`/quiz/${quiz.id}`} key={quiz.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-indigo-600 hover:shadow-xl transition-all group">
                <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all"><i className="fas fa-file-signature text-xl"></i></div><div><h4 className="font-black text-gray-800 line-clamp-1">{quiz.title}</h4><p className="text-[10px] font-black text-gray-400 uppercase">{quiz.questions.length} CÂU HỎI</p></div></div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50"><div className="flex items-center gap-2 text-gray-400"><i className="fas fa-clock text-xs"></i><span className="text-xs font-bold">{quiz.durationMinutes} phút</span></div><span className="text-indigo-600 text-[10px] font-black uppercase group-hover:translate-x-1 transition-transform">Bắt đầu <i className="fas fa-arrow-right"></i></span></div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-xl font-black text-gray-900 px-2">Tóm tắt thành tích</h2>
           <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Điểm trung bình</p><h4 className="text-4xl font-black text-indigo-600">{avgScore}%</h4></div>
                <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-3xl text-indigo-600"><i className="fas fa-chart-line"></i></div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase"><span>Ghi nhớ câu hỏi</span><span>{masteryRate}%</span></div>
                <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden"><div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${masteryRate}%` }}></div></div>
              </div>
              <p className="text-xs font-medium text-gray-400 italic">"Kiến thức là sức mạnh, hãy không ngừng rèn luyện!"</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
