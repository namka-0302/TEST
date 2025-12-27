
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuizResult } from '../types';

interface SystemHistoryProps {
  results: QuizResult[];
}

const SystemHistory: React.FC<SystemHistoryProps> = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sắp xếp nhật ký mới nhất lên đầu
  const sortedResults = [...results].sort((a, b) => b.timestamp - a.timestamp);
  
  const filteredResults = sortedResults.filter(res => {
    const userName = (res.userName || '').toLowerCase();
    const quizTitle = (res.quizTitle || '').toLowerCase();
    return userName.includes(searchTerm.toLowerCase()) || quizTitle.includes(searchTerm.toLowerCase());
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 px-1 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Nhật ký hệ thống</h1>
          <p className="text-gray-500 text-sm font-medium">Theo dõi hoạt động làm bài của toàn bộ học viên.</p>
        </div>
        <div className="relative w-full md:w-64">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input 
            type="text" 
            placeholder="Tìm theo tên học viên..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
          />
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-200">
            <i className="fas fa-history text-2xl"></i>
          </div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Chưa có bản ghi nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Học viên</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bài thi</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kết quả</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredResults.map((res, idx) => {
                  const percent = Math.round((res.score / res.totalQuestions) * 100);
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5 font-mono text-xs text-gray-500">{formatDate(res.timestamp)}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black uppercase">
                            {(res.userName || 'U').charAt(0)}
                          </div>
                          <span className="font-black text-gray-900 text-sm">{res.userName || 'Học viên ẩn danh'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{res.quizTitle || 'Bài thi trắc nghiệm'}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight mt-1">Thời gian: {formatTime(res.timeSpent)}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                           <span className={`text-sm font-black ${percent >= 80 ? 'text-green-600' : percent >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                             {res.score}/{res.totalQuestions}
                           </span>
                           <div className="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${percent >= 80 ? 'bg-green-500' : percent >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${percent}%` }}></div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link to={`/students?id=${res.userId}`} className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:text-indigo-600 transition-all">
                          <i className="fas fa-user-circle"></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {filteredResults.map((res, idx) => {
               const percent = Math.round((res.score / res.totalQuestions) * 100);
               return (
                 <div key={idx} className="p-5 flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-[10px] font-black uppercase">
                         {(res.userName || 'U').charAt(0)}
                       </div>
                       <div>
                         <p className="font-black text-gray-900 text-sm">{res.userName || 'Học viên ẩn danh'}</p>
                         <p className="font-mono text-[9px] text-gray-400 uppercase tracking-widest">{formatDate(res.timestamp)}</p>
                       </div>
                     </div>
                     <span className={`text-xs font-black ${percent >= 80 ? 'text-green-600' : percent >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                       {res.score}/{res.totalQuestions}
                     </span>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-2xl">
                     <p className="text-xs font-bold text-gray-800">{res.quizTitle || 'Bài thi trắc nghiệm'}</p>
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Hoàn thành trong {formatTime(res.timeSpent)}</p>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHistory;