
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question } from '../types';

interface QuestionBankProps {
  questions: Question[];
  onDeleteQuestion: (id: string) => void;
}

const ITEMS_PER_PAGE = 12;

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
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn px-2 sm:px-6 pb-24">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Ngân hàng học liệu</h1>
            <p className="text-slate-500 font-medium mt-2">Hệ thống đang lưu trữ <span className="text-indigo-600 font-black">{questions.length}</span> câu hỏi được phân loại theo AI.</p>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
             <button onClick={() => navigate('/upload')} className="flex-grow lg:flex-grow-0 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 hover:bg-slate-50 shadow-sm transition-all"><i className="fas fa-magic text-indigo-600"></i> AI IMPORT</button>
             <button onClick={() => navigate('/manual-add')} className="flex-grow lg:flex-grow-0 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"> <i className="fas fa-plus"></i> THÊM MỚI</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="sm:col-span-3 relative">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input type="text" placeholder="Tìm kiếm kiến thức hoặc từ khóa..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-sm shadow-inner" />
          </div>
          <select value={filterDifficulty} onChange={(e) => { setFilterDifficulty(e.target.value as any); setCurrentPage(1); }} className="px-6 py-4 rounded-2xl border-none bg-slate-900 text-white text-xs font-black outline-none cursor-pointer hover:bg-black transition-all appearance-none text-center">
            <option value="All">TẤT CẢ ĐỘ KHÓ</option>
            <option value="Easy">DỄ (EASY)</option>
            <option value="Medium">VỪA (MEDIUM)</option>
            <option value="Hard">KHÓ (HARD)</option>
          </select>
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
           <i className="fas fa-database text-slate-100 text-7xl mb-6"></i>
           <h3 className="text-xl font-black text-slate-900">Không tìm thấy kết quả</h3>
           <p className="text-slate-400 font-medium max-w-sm mt-2">Thử điều chỉnh từ khóa hoặc bộ lọc để AI có thể giúp bạn tìm kiếm tốt hơn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((q) => (
            <div key={q.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between group h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' : q.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{q.difficulty}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/edit-question/${q.id}`)} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center text-xs"><i className="fas fa-edit"></i></button>
                    <button onClick={() => { if(window.confirm('Xác nhận xóa câu hỏi này?')) onDeleteQuestion(q.id); }} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center text-xs"><i className="fas fa-trash"></i></button>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-800 leading-snug line-clamp-3 group-hover:line-clamp-none transition-all duration-500">{q.text}</p>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50">
                  {q.choices.map(c => <div key={c.id} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${c.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300'}`}>{c.label}</div>)}
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-10 h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, (q.seenCount || 0) * 10)}%` }}></div></div>
                   <span className="text-[9px] font-black text-slate-400 uppercase">{q.seenCount || 0} LẦN XEM</span>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase">ID: {q.id.substring(0,4)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-12 pb-10">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-900 disabled:opacity-20 shadow-sm active:scale-90 transition-all"><i className="fas fa-chevron-left"></i></button>
          <div className="bg-slate-900 px-10 py-4 rounded-2xl text-white font-black text-sm shadow-xl tracking-widest">{currentPage} / {totalPages}</div>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-900 disabled:opacity-20 shadow-sm active:scale-90 transition-all"><i className="fas fa-chevron-right"></i></button>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
