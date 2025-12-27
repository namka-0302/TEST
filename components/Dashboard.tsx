
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  
  const leaderboard = useMemo(() => {
    const students = accounts.filter(a => a.role === 'User');
    return students.map(s => {
      const studentResults = results.filter(r => r.userId === s.id);
      const avgScore = studentResults.length > 0 
        ? Math.round(studentResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) / studentResults.length)
        : 0;
      return { id: s.id, name: s.name, avgScore, count: studentResults.length };
    }).sort((a, b) => b.avgScore - a.avgScore).slice(0, 5);
  }, [accounts, results]);

  if (isAdmin) {
    const adminStats = [
      { label: 'Ngân hàng', value: questions.length, icon: 'fa-database', color: 'text-blue-600', bg: 'bg-blue-50', path: '/bank' },
      { label: 'Bài thi', value: quizzes.length, icon: 'fa-clipboard-check', color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/quizzes' },
      { label: 'Học viên', value: accounts.filter(a => a.role === 'User').length, icon: 'fa-user-graduate', color: 'text-purple-600', bg: 'bg-purple-50', path: '/students' },
      { label: 'Lượt thi', value: results.length, icon: 'fa-bolt', color: 'text-orange-600', bg: 'bg-orange-50', path: '/history' },
    ];

    return (
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10 animate-fadeIn px-2 sm:px-6">
        <div className="bg-slate-900 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3 sm:space-y-4">
              <span className="bg-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Admin Dashboard</span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Hệ thống Quản trị AI</h1>
              <p className="text-slate-400 font-medium text-sm sm:text-lg max-w-xl">Xin chào, {user.name}. Bạn có {quizzes.length} đề thi đang hoạt động và {questions.length} câu hỏi trong ngân hàng.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button onClick={onManualSync} className="bg-white/10 px-8 py-4 rounded-2xl font-black text-sm hover:bg-white/20 transition-all text-center">ĐỒNG BỘ CLOUD</button>
              <Link to="/upload" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 text-center">TẠO HỌC LIỆU MỚI</Link>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {adminStats.map((stat, idx) => (
            <Link to={stat.path} key={idx} className="bg-white p-5 sm:p-7 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:scale-[1.02] hover:shadow-lg">
              <div className={`${stat.bg} ${stat.color} w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0`}><i className={`fas ${stat.icon}`}></i></div>
              <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p><h3 className="text-xl sm:text-3xl font-black text-slate-900 leading-none">{stat.value}</h3></div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 pb-10">
           <div className="lg:col-span-2 bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 sm:p-8 border-b border-slate-50 flex justify-between items-center"><h2 className="text-lg sm:text-xl font-black text-slate-900">Bài thi mới cập nhật</h2><Link to="/quizzes" className="text-indigo-600 font-black text-xs sm:text-sm">Tất cả bài thi</Link></div>
              <div className="flex-grow p-4 sm:p-6 space-y-2">
                {quizzes.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-slate-300 italic font-medium">Chưa có bài thi nào được tạo</div>
                ) : (
                  quizzes.slice(0, 5).map(quiz => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all"><i className="fas fa-file-lines"></i></div>
                        <div><h4 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-1">{quiz.title}</h4><p className="text-[10px] font-black text-slate-400 uppercase">{quiz.questions.length} câu • {quiz.durationMinutes} phút</p></div>
                      </div>
                      <Link to={`/edit-quiz/${quiz.id}`} className="text-slate-300 hover:text-indigo-600 p-2"><i className="fas fa-chevron-right"></i></Link>
                    </div>
                  ))
                )}
              </div>
           </div>
           
           <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><i className="fas fa-ranking-star text-amber-500"></i> Bảng vàng</h2>
              <div className="space-y-4">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-10 text-slate-300 font-medium italic">Đang chờ dữ liệu thi...</div>
                ) : (
                  leaderboard.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/50 border border-slate-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${i===0?'bg-amber-500 text-white':i===1?'bg-slate-400 text-white':i===2?'bg-orange-400 text-white':'bg-white text-slate-300 border'}`}>{i+1}</div>
                      <div className="flex-grow overflow-hidden"><p className="font-black text-slate-800 text-sm truncate">{s.name}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.count} lượt thi</p></div>
                      <div className="text-right shrink-0"><p className="text-lg font-black text-indigo-600">{s.avgScore}%</p></div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  // USER VIEW
  const studentStats = useMemo(() => {
    const userResults = results.filter(r => r.userId === user.id);
    const totalSeen = questions.filter(q => userProgress[q.id] > 0).length;
    const masteryRate = questions.length > 0 ? Math.round((totalSeen / questions.length) * 100) : 0;
    const avgScore = userResults.length > 0 
      ? Math.round(userResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / userResults.length * 100)
      : 0;
    const recentResults = userResults.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
    return { totalSeen, masteryRate, avgScore, recentResults };
  }, [results, user.id, questions, userProgress]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10 animate-fadeIn px-2 sm:px-6 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-indigo-900 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight">Chào {user.name.split(' ').pop()}!</h1>
            <p className="text-indigo-200 font-medium text-base sm:text-xl max-w-lg leading-relaxed">
              Bạn đã hoàn thành <span className="text-white font-black">{studentStats.totalSeen}</span> câu hỏi. 
              Ghi nhớ được {studentStats.masteryRate}% học liệu.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-8">
            <Link to="/learn" className="bg-white text-indigo-900 px-10 py-5 rounded-[1.5rem] sm:rounded-[2rem] font-black shadow-2xl hover:scale-[1.05] active:scale-95 transition-all text-center">ÔN TẬP BÀI HỌC</Link>
            <Link to="/mock-exam" className="bg-indigo-500 text-white px-10 py-5 rounded-[1.5rem] sm:rounded-[2rem] font-black shadow-2xl hover:bg-indigo-600 transition-all text-center border border-indigo-400">THI THỬ (30P)</Link>
          </div>
          <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 border border-slate-100 shadow-xl flex flex-col">
           <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3"><i className="fas fa-history text-indigo-500"></i> Lịch sử thi</h2>
              <Link to="/my-history" className="text-[10px] font-black text-indigo-600 uppercase">Xem tất cả</Link>
           </div>
           <div className="space-y-4 flex-grow">
             {studentStats.recentResults.length === 0 ? (
               <div className="h-full flex items-center justify-center text-slate-300 italic text-center text-sm p-4">Bạn chưa thực hiện bài thi nào.</div>
             ) : (
               studentStats.recentResults.map((res, i) => (
                 <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                   <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center text-indigo-600 font-black text-sm">{Math.round((res.score/res.totalQuestions)*100)}%</div>
                   <div className="flex-grow overflow-hidden">
                      <p className="font-black text-slate-800 text-xs truncate">{res.quizTitle || 'Bài thi trắc nghiệm'}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase">{new Date(res.timestamp).toLocaleDateString()}</p>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Kỳ thi giáo viên</h2>
            <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{quizzes.length} đề thi</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {quizzes.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <i className="fas fa-clipboard-list text-slate-200 text-5xl mb-4"></i>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Hiện chưa có bài thi nào</p>
              </div>
            ) : (
              quizzes.map(quiz => (
                <Link to={`/quiz/${quiz.id}`} key={quiz.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-600 hover:shadow-2xl transition-all group flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                      <i className="fas fa-file-pen text-2xl"></i>
                    </div>
                    <h4 className="font-black text-slate-900 text-lg sm:text-xl leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">{quiz.title}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{quiz.questions.length} CÂU HỎI TRẮC NGHIỆM</p>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase"><i className="fas fa-clock"></i> {quiz.durationMinutes} PHÚT</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-lg">
                      <i className="fas fa-arrow-right text-xs"></i>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="space-y-8">
           <h2 className="text-xl sm:text-2xl font-black text-slate-900 px-2">Phân tích năng lực</h2>
           <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] p-10 border border-slate-100 shadow-xl space-y-10 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Điểm trung bình</p>
                  <h4 className="text-5xl font-black text-indigo-600 leading-none">{studentStats.avgScore}%</h4>
                </div>
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner"><i className="fas fa-chart-line"></i></div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-[11px] font-black text-slate-900 uppercase">
                  <span>Mức độ ghi nhớ</span>
                  <span className="text-indigo-600">{studentStats.masteryRate}%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${studentStats.masteryRate}%` }}></div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative z-10">
                <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                  "Sự kiên trì trong học tập hôm nay là chìa khóa mở ra cánh cửa tương lai rạng rỡ của chính bạn."
                </p>
              </div>
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full blur-2xl opacity-50"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
