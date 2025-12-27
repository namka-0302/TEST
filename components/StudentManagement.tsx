
import React, { useState } from 'react';
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
    return results.filter(r => r.userId === userId);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Quản lý học viên</h1>
          <p className="text-gray-500 font-medium">Theo dõi tiến độ và hiệu suất học tập của toàn bộ lớp.</p>
        </div>
        <div className="bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 flex items-center gap-3">
          <i className="fas fa-users text-indigo-600"></i>
          <span className="font-black text-indigo-900">{students.length} Học viên</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Danh sách lớp</h3>
          <div className="space-y-2">
            {students.map(student => {
              const studentResults = getStudentResults(student.id);
              const avgScore = studentResults.length > 0 
                ? Math.round(studentResults.reduce((acc, curr) => acc + (curr.score/curr.totalQuestions), 0) / studentResults.length * 100)
                : 0;

              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-left p-5 rounded-[2rem] border transition-all flex items-center gap-4 group ${
                    selectedStudentId === student.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'bg-white border-gray-100 text-gray-900 hover:border-indigo-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 ${
                    selectedStudentId === student.id ? 'bg-white/20' : 'bg-gray-50 text-indigo-600'
                  }`}>
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="font-black truncate">{student.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        selectedStudentId === student.id ? 'text-indigo-100' : 'text-gray-400'
                      }`}>
                        {studentResults.length} lượt thi
                      </span>
                      <span className="w-1 h-1 rounded-full bg-current opacity-20"></span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${
                        selectedStudentId === student.id ? 'text-indigo-100' : 'text-green-600'
                      }`}>
                        Avg: {avgScore}%
                      </span>
                    </div>
                  </div>
                  <i className={`fas fa-chevron-right text-[10px] ${selectedStudentId === student.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} transition-opacity`}></i>
                </button>
              );
            })}
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2">
          {!selectedStudentId ? (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200 text-3xl">
                <i className="fas fa-id-card"></i>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Chưa chọn học viên</h3>
              <p className="text-gray-400 font-medium">Chọn một học viên bên trái để xem tiến độ chi tiết.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Profile Card */}
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-900 flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                  {students.find(s => s.id === selectedStudentId)?.name.charAt(0)}
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-2xl font-black text-gray-900">{students.find(s => s.id === selectedStudentId)?.name}</h2>
                  <p className="text-gray-500 font-medium italic mt-1">Tài khoản: {students.find(s => s.id === selectedStudentId)?.username}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                       <p className="text-xl font-black text-gray-900">{getStudentResults(selectedStudentId).length}</p>
                       <p className="text-[8px] font-black text-gray-400 uppercase mt-1">Bài thi đã làm</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center">
                       <p className="text-xl font-black text-green-600">
                         {Math.max(0, ...getStudentResults(selectedStudentId).map(r => Math.round(r.score/r.totalQuestions*100)))}%
                       </p>
                       <p className="text-[8px] font-black text-gray-400 uppercase mt-1">Điểm cao nhất</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* History List */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-50">
                  <h3 className="text-lg font-black text-gray-900">Lịch sử bài thi</h3>
                </div>
                {getStudentResults(selectedStudentId).length === 0 ? (
                  <div className="p-16 text-center text-gray-400 italic">Học viên này chưa tham gia bài thi nào.</div>
                ) : (
                  <div className="p-4 space-y-3">
                    {getStudentResults(selectedStudentId).map((res, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                            (res.score/res.totalQuestions) >= 0.8 ? 'bg-green-50 text-green-600' : 
                            (res.score/res.totalQuestions) >= 0.5 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                          }`}>
                            <i className="fas fa-file-invoice"></i>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{res.quizTitle || 'Bài thi trắc nghiệm'}</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                              {new Date(res.timestamp).toLocaleDateString()} • {formatTime(res.timeSpent)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-black ${
                            (res.score/res.totalQuestions) >= 0.8 ? 'text-green-600' : 
                            (res.score/res.totalQuestions) >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {res.score}/{res.totalQuestions}
                          </p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Đạt {Math.round(res.score/res.totalQuestions*100)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interaction simulation */}
              <div className="flex gap-4">
                <button className="flex-grow bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-black text-sm border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                  <i className="fas fa-paper-plane"></i> Gửi thông báo nhắc nhở
                </button>
                <button className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-black text-sm border border-red-100 hover:bg-red-100 transition-all">
                  <i className="fas fa-history"></i> Reset tiến độ
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