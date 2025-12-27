
import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionBankProps {
  questions: Question[];
  onDeleteQuestion: (id: string) => void;
}

const ITEMS_PER_PAGE = 20;

const QuestionBank: React.FC<QuestionBankProps> = ({ questions, onDeleteQuestion }) => {
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 animate-fadeIn pb-20 px-1 md:px-0">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Ngân hàng câu hỏi</h1>
          <p className="text-gray-500 text-sm font-medium">Đang quản lý {questions.length} tài nguyên giáo dục.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative flex-grow">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm nội dung..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <select 
            value={filterDifficulty}
            onChange={(e) => { setFilterDifficulty(e.target.value as any); setCurrentPage(1); }}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-600 outline-none"
          >
            <option value="All">Tất cả cấp độ</option>
            <option value="Easy">Dễ</option>
            <option value="Medium">Trung bình</option>
            <option value="Hard">Khó</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Câu hỏi</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Đáp án</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mức độ</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">Không tìm thấy kết quả phù hợp.</td>
              </tr>
            ) : (
              currentItems.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{q.text}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {q.choices.map(c => (
                        <span key={c.id} className={`w-6 h-6 text-[10px] rounded-lg flex items-center justify-center font-black ${c.isCorrect ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                          {c.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${
                      q.difficulty === 'Easy' ? 'text-green-600 bg-green-50' :
                      q.difficulty === 'Hard' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDeleteQuestion(q.id)}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-300 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all"
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {currentItems.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center text-gray-400 border border-dashed border-gray-200">
            Không tìm thấy kết quả.
          </div>
        ) : (
          currentItems.map((q) => (
            <div key={q.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                  q.difficulty === 'Easy' ? 'text-green-600 bg-green-50' :
                  q.difficulty === 'Hard' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'
                }`}>
                  {q.difficulty}
                </span>
                <button 
                  onClick={() => onDeleteQuestion(q.id)}
                  className="text-gray-300 hover:text-red-600 p-1"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
              <p className="text-base font-bold text-gray-800 leading-snug">{q.text}</p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50 mt-2">
                {q.choices.map(c => (
                  <div key={c.id} className="flex items-center gap-1.5">
                    <span className={`w-6 h-6 text-[10px] rounded-lg flex items-center justify-center font-black ${c.isCorrect ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {c.label}
                    </span>
                    {c.isCorrect && <span className="text-[10px] font-bold text-green-600">Đúng</span>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 disabled:opacity-30 shadow-sm"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 text-sm font-black text-gray-700 shadow-sm">
             {currentPage} / {totalPages}
          </div>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 disabled:opacity-30 shadow-sm"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
