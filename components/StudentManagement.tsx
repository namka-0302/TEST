
import React, { useState, useMemo } from 'react';
import { Account, QuizResult } from '../types';

interface StudentManagementProps {
  accounts: Account[];
  results: QuizResult[];
  questionsCount: number;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ accounts, results, questionsCount }) => {
  const students = accounts.filter(a => a.role === 'User');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const getStudentResults = (userId: string) => {
    return results.filter(r => r.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  };

  // Tính toán thống kê toàn lớp
  const classStats = useMemo(() => {
    if (students.length === 0) return null;
    
    const totalQuizzes = results.length;
    const avgScore = results.length > 0 
      ? Math.round(results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / results.length * 100)
      : 0;
      
    const excellentCount = students.filter(s => {
      const res = getStudentResults(s.id);
      if (res.length === 0) return false;
      const sAvg = res.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / res.length;
      return sAvg >= 0.8;
    }).length;

    return { totalQuizzes, avgScore, excellentCount };
  }, [students, results]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20 px-1 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Cộng đồng học viên</h1>
          <p className="text-gray-500 font-medium mt-1">Nơi giáo viên theo dõi hành trình và sự bứt phá của học sinh.</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-indigo-600 px-6 py-3 rounded-2xl text-white flex items-center gap-3 shadow-xl shadow-indigo-100">
             <i className="fas fa-users"></i>
             <span className="font-black">{students.length}</span>
           </div>
           <button className="bg-white border border-gray-100 p-3 rounded-2xl text-gray-400 hover:text-indigo-600 transition-colors shadow-sm">
             <i className="fas fa-envelope"></i>
           </button>
        </div>
      </div>

      {/* Class Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-2xl">
              <i className="fas fa-graduation-cap"></i>
           </div>
           <div>
              <h4 className="text-2xl font-black text-gray-900">{classStats?.avgScore}%</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Điểm trung bình lớp</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center text-2xl">
              <i className="fas fa-star"></i>
           </div>
           <div>
              <h4 className="text-2xl font-black text-gray-900">{classStats?.excellentCount}</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Học viên xuất sắc</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
           <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-2xl">
              <i className="fas fa-history"></i>
           </div>
           <div>
              <h4 className="text-2xl font-black text-gray-900">{classStats?.totalQuizzes}</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lượt thi toàn hệ thống</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách học viên</h3>
            <span className="text-[10px] font-black text-indigo-600 uppercase">A-Z</span>
          </div>
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar p-1">
            {students.map(student => {
              const studentResults = getStudentResults(student.id);
              const avgScore = studentResults.length > 0 
                ? Math.round(studentResults.reduce((acc, curr) => acc + (curr.score/curr.totalQuestions), 0) / studentResults.length * 100)
                : 0;

              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-left p-5 rounded-[2.2rem] border-2 transition-all flex items-center gap-4 group relative ${
                    selectedStudentId === student.id 
                    ? 'bg-gray-900 border-gray-900 text-white shadow-2xl' 
                    : 'bg-white border-gray-50 text-gray-900 hover:border-indigo-100 shadow-sm'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 transition-transform group-hover:scale-110 ${
                    selectedStudentId === student.id ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="font-black text-base truncate">{student.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1">
                        <i className="fas fa-fire text-orange-400 text-[10px]"></i>
                        <span className={`text-[10px] font-black ${selectedStudentId === student.id ? 'text-gray-400' : 'text-gray-400'}`}>
                          {studentResults.length} bài
                        </span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
                        selectedStudentId === student.id ? 'bg-white/20 text-white' : 'bg-green-50 text-green-600'
                      }`}>
                        {avgScore}%
                      </span>
                    </div>
                  </div>
                  {selectedStudentId === student.id && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                       <i className="fas fa-chevron-right text-indigo-400"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2">
          {!selectedStudentId ? (
            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200 h-full flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 text-gray-200 text-4xl">
                <i className="fas fa-user-circle"></i>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Bắt đầu theo dõi</h3>
              <p className="text-gray-400 font-medium max-w-xs mx-auto">Chọn một học viên từ danh sách để xem dữ liệu học tập chi tiết.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Profile Overview Card */}
              <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl flex flex-col md:flex-row gap-10 items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 opacity-50"></div>
                
                <div className="relative">
                   <div className="w-28 h-28 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl rotate-3">
                     {students.find(s => s.id === selectedStudentId)?.name.charAt(0)}
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-green-500 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-white text-sm shadow-lg">
                      <i className="fas fa-check"></i>
                   </div>
                </div>

                <div className="flex-grow text-center md:text-left z-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                     <h2 className="text-3xl font-black text-gray-900 leading-tight">
                       {students.find(s => s.id === selectedStudentId)?.name}
                     </h2>
                     <span className="bg-gray-100 px-3 py-1 rounded-full text-[9px] font-black text-gray-400 uppercase w-max mx-auto md:mx-0">
                       Học viên ID: {selectedStudentId.substring(0,6)}
                     </span>
                  </div>
                  <p className="text-gray-400 font-bold mb-8">@{students.find(s => s.id === selectedStudentId)?.username}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-indigo-50/50 p-4 rounded-3xl border border-indigo-100/50">
                       <p className="text-xl font-black text-indigo-700">{getStudentResults(selectedStudentId).length}</p>
                       <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">Lượt thi</p>
                    </div>
                    <div className="bg-green-50/50 p-4 rounded-3xl border border-green-100/50">
                       <p className="text-xl font-black text-green-700">
                         {Math.max(0, ...getStudentResults(selectedStudentId).map(r => Math.round(r.score/r.totalQuestions*100)))}%
                       </p>
                       <p className="text-[8px] font-black text-green-400 uppercase tracking-widest mt-1">Max Score</p>
                    </div>
                    <div className="bg-orange-50/50 p-4 rounded-3xl border border-orange-100/50">
                       <p className="text-xl font-black text-orange-700">95%</p>
                       <p className="text-[8px] font-black text-orange-400 uppercase tracking-widest mt-1">Chăm chỉ</p>
                    </div>
                    <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100/50">
                       <p className="text-xl font-black text-blue-700">A+</p>
                       <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">Xếp hạng</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail History List */}
              <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-gray-900">Chi tiết các bài thi</h3>
                  <button className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all">Xuất báo cáo</button>
                </div>
                
                {getStudentResults(selectedStudentId).length === 0 ? (
                  <div className="p-20 text-center text-gray-300 italic">Học viên chưa thực hiện bài thi nào.</div>
                ) : (
                  <div className="p-6 space-y-4">
                    {getStudentResults(selectedStudentId).map((res, idx) => {
                      const scoreRate = res.score / res.totalQuestions;
                      return (
                        <div key={idx} className="flex flex-col md:flex-row items-center justify-between p-6 rounded-[2rem] border-2 border-gray-50 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all gap-4">
                          <div className="flex items-center gap-5 w-full md:w-auto">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                              scoreRate >= 0.8 ? 'bg-green-100 text-green-600' : 
                              scoreRate >= 0.5 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                            }`}>
                              <i className="fas fa-poll-h"></i>
                            </div>
                            <div>
                              <h4 className="font-black text-gray-800 leading-tight">{res.quizTitle || 'Bài thi trắc nghiệm'}</h4>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                {new Date(res.timestamp).toLocaleDateString()} • {formatTime(res.timeSpent)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                             <div className="text-right">
                                <p className={`text-2xl font-black leading-none ${
                                  scoreRate >= 0.8 ? 'text-green-600' : scoreRate >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {res.score}/{res.totalQuestions}
                                </p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1">Đạt {Math.round(scoreRate * 100)}%</p>
                             </div>
                             <div className="w-px h-10 bg-gray-100"></div>
                             <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                                <i className="fas fa-chevron-right text-xs"></i>
                             </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-grow bg-gray-900 text-white py-5 rounded-[2rem] font-black text-sm hover:bg-black shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 group">
                  <i className="fas fa-bell text-yellow-400 group-hover:rotate-12 transition-transform"></i> GỬI THÔNG BÁO NHẮC NHỞ
                </button>
                <button className="px-10 bg-red-50 text-red-600 py-5 rounded-[2rem] font-black text-sm border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                  <i className="fas fa-trash-alt"></i> RESET DỮ LIỆU
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
