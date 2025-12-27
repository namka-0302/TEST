
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
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-500 text-sm">Managing {questions.length} total resources.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select 
            value={filterDifficulty}
            onChange={(e) => { setFilterDifficulty(e.target.value as any); setCurrentPage(1); }}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="All">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Question</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Options</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Level</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No questions found.</td>
              </tr>
            ) : (
              currentItems.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{q.text}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {q.choices.map(c => (
                        <span key={c.id} className={`w-5 h-5 text-[9px] rounded flex items-center justify-center font-bold ${c.isCorrect ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {c.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      q.difficulty === 'Easy' ? 'text-green-600 bg-green-50' :
                      q.difficulty === 'Hard' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-2 text-gray-300 hover:text-red-600 transition-colors"
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 px-4 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50"
          >
            <i className="fas fa-chevron-left mr-2"></i> Prev
          </button>
          <span className="text-sm font-bold text-gray-500">Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 px-4 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50"
          >
            Next <i className="fas fa-chevron-right ml-2"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
