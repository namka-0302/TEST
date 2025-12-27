
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Quiz } from '../types';

interface QuizManagementProps {
  quizzes: Quiz[];
  onDeleteQuiz: (id: string) => void;
}

const QuizManagement: React.FC<QuizManagementProps> = ({ quizzes, onDeleteQuiz }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Xác nhận xóa bài thi "${title}"?`)) {
      onDeleteQuiz(id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 px-1 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Quản lý bài thi</h1>
          <p className="text-gray-500 text-sm font-medium">Bạn đang có {quizzes.length} bài thi trong hệ thống.</p>
        </div>
        <Link to="/create-quiz" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2">
          <i className="fas fa-plus"></i> Tạo bài thi mới
        </Link>
      </div>

      <div className="relative">
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input 
          type="text" 
          placeholder="Tìm kiếm bài thi theo tên..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold"
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên bài thi</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Số câu</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời lượng</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ngày tạo</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400 italic">Không tìm thấy bài thi nào.</td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 font-bold text-gray-900">{quiz.title}</td>
                    <td className="px-8 py-5">
                      <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-black">
                        {quiz.questions.length} câu
                      </span>
                    </td>
                    <td className="px-8 py-5 font-mono text-sm text-gray-500">{quiz.durationMinutes} phút</td>
                    <td className="px-8 py-5 text-gray-400 text-xs">{new Date(quiz.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
                        className="w-9 h-9 rounded-xl bg-white border border-gray-100 text-indigo-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleDelete(quiz.id, quiz.title)}
                        className="w-9 h-9 rounded-xl bg-white border border-gray-100 text-gray-300 hover:text-red-600 hover:border-red-100 transition-all"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-50">
          {filteredQuizzes.map(quiz => (
            <div key={quiz.id} className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 flex-grow">{quiz.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/edit-quiz/${quiz.id}`)} className="text-indigo-400 p-2"><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleDelete(quiz.id, quiz.title)} className="text-gray-300 p-2"><i className="fas fa-trash"></i></button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <span>{quiz.questions.length} câu hỏi</span>
                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                <span>{quiz.durationMinutes} phút</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;
