
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question } from '../types';

interface QuestionBankProps {
  questions: Question[];
  onDeleteQuestion: (id: string) => void;
}

const ITEMS_PER_PAGE = 15;

const QuestionBank: React.FC<QuestionBankProps> = ({ questions, onDeleteQuestion }) => {
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const filtered = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-8 animate-fadeIn pb-20 px-1 md:px-0">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Ngân hàng học liệu</h1>
            <p className="text-gray-500 font-medium">Kho lưu trữ <span className="text-indigo-600 font-black">{questions.length}</span> câu hỏi được đồng bộ Cloud.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button 
                onClick={() => navigate('/upload')}
                className="flex-grow md:flex-grow-0 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
              >
                <i className="fas fa-magic text-indigo-600"></i> AI Import
              </button>
              <button 
                onClick={() => navigate('/manual-add')}
                className="flex-grow md:flex-grow-0 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                <i className="fas fa-plus"></i> Thêm mới
              </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-3 relative">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm nội dung câu hỏi hoặc từ khóa..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-gray-100 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-sm shadow-sm"
            />
          </div>
          <select 
            value={filterDifficulty}
            onChange={(e) => { setFilterDifficulty(e.target.value as any); setCurrentPage(1); }}
            className="px-6 py-4 rounded-[1.5rem] border border-gray-100 bg-white text-sm font-black text-gray-600 outline-none shadow-sm cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <option value="All">Tất cả cấp độ</option>
            <option value="Easy">Dễ (Easy)</option>
            <option value="Medium">Vừa (Medium)</option>
            <option value="Hard">Khó (Hard)</option>
          </select>
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200 shadow-sm flex flex-col items-center justify-center">
           <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 text-4xl mb-6">
              <i className="fas fa-database"></i>
           </div>
           <h3 className="text-xl font-black text-gray-900">Không có dữ liệu phù hợp</h3>
           <p className="text-gray-400 font-medium max-w-sm mt-2">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc độ khó để tìm thấy nội dung.</p>
           <button onClick={() => {setSearch(''); setFilterDifficulty('All');}} className="mt-8 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">Xóa tất cả bộ lọc</button>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-16">#</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội dung câu hỏi</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Độ khó</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mastery</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentItems.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-8 py-5">
                       <span className="text-[10px] font-black text-gray-300">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">{q.text}</p>
                      <div className="flex gap-1.5 mt-2">
                        {q.choices.map(c => (
                          <div key={c.id} className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black ${c.isCorrect ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                            {c.label}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                        q.difficulty === 'Easy' ? 'text-green-600 bg-green-50' :
                        q.difficulty === 'Hard' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-500">{q.seenCount || 0}</span>
                          <div className="w-12 h-1 bg-gray-100 rounded-full">
                             <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (q.seenCount || 0) * 10)}%` }}></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/edit-question/${q.id}`)}
                          className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => { if(window.confirm('Xóa câu hỏi này?')) onDeleteQuestion(q.id); }}
                          className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {currentItems.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-200">#{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</span>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                      q.difficulty === 'Easy' ? 'text-green-600 bg-green-50' :
                      q.difficulty === 'Hard' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/edit-question/${q.id}`)} className="text-indigo-400 p-2"><i className="fas fa-edit"></i></button>
                    <button onClick={() => { if(window.confirm('Xóa câu hỏi?')) onDeleteQuestion(q.id); }} className="text-gray-300 p-2"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </div>
                <p className="text-base font-bold text-gray-800 leading-snug">{q.text}</p>
                <div className="flex flex-wrap gap-1 pt-4 border-t border-gray-50">
                  {q.choices.map(c => (
                    <div key={c.id} className={`w-8 h-8 text-[10px] rounded-lg flex items-center justify-center font-black ${c.isCorrect ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-400 disabled:opacity-30 shadow-sm active:scale-90 transition-all"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="bg-white px-8 py-3 rounded-2xl border border-gray-100 text-sm font-black text-gray-900 shadow-sm">
                 TRANG {currentPage} / {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-200 text-gray-400 disabled:opacity-30 shadow-sm active:scale-90 transition-all"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionBank;
