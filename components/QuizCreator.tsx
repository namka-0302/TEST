
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Question, Quiz } from '../types';

interface QuizCreatorProps {
  questions: Question[];
  onSaveQuiz: (quiz: Quiz) => void;
  quizzes: Quiz[];
  isEdit?: boolean;
}

const QuizCreator: React.FC<QuizCreatorProps> = ({ questions, onSaveQuiz, quizzes, isEdit }) => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [randomCount, setRandomCount] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit && id) {
      const existingQuiz = quizzes.find(q => q.id === id);
      if (existingQuiz) {
        setTitle(existingQuiz.title);
        setDuration(existingQuiz.durationMinutes);
        setSelectedIds(new Set(existingQuiz.questions.map(q => q.id)));
      }
    }
  }, [id, isEdit, quizzes]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleCreate = () => {
    if (!title || selectedIds.size === 0) {
      alert("Vui lòng nhập tên bài thi và chọn ít nhất một câu hỏi.");
      return;
    }
    
    const selectedQuestions = questions.filter(q => selectedIds.has(q.id));
    const newQuiz: Quiz = {
      id: isEdit && id ? id : Math.random().toString(36).substr(2, 9),
      title,
      durationMinutes: duration,
      questions: selectedQuestions,
      createdAt: isEdit && id ? (quizzes.find(q => q.id === id)?.createdAt || Date.now()) : Date.now()
    };

    onSaveQuiz(newQuiz);
    navigate('/quizzes');
  };

  // Thuật toán Shuffle chuẩn (Fisher-Yates) kết hợp Timestamp để đảm bảo tính ngẫu nhiên
  const shuffleArray = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      // Sử dụng Math.random() thông thường hoặc seed dựa trên nano-time
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const selectRandomSmart = () => {
    const count = Math.min(randomCount, questions.length);
    if (count <= 0) return;
    
    // Ưu tiên câu chưa thuộc (seenCount = 0), sau đó mới đến các câu khác
    const unseen = shuffleArray(questions.filter(q => q.seenCount === 0));
    const seen = shuffleArray(questions.filter(q => q.seenCount > 0).sort((a, b) => a.seenCount - b.seenCount));
    
    let pool: string[] = [];
    if (unseen.length >= count) {
      pool = unseen.slice(0, count).map(q => q.id);
    } else {
      const remaining = count - unseen.length;
      pool = [
        ...unseen.map(q => q.id),
        ...seen.slice(0, remaining).map(q => q.id)
      ];
    }

    setSelectedIds(new Set(pool));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20 px-1 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">
            {isEdit ? 'Chỉnh sửa bài thi' : 'Xây dựng bài thi'}
          </h1>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên bài thi</label>
            <input 
              type="text" 
              placeholder="VD: Kiểm tra giữa kỳ Tin học" 
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold shadow-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thời gian (Phút)</label>
            <input 
              type="number" 
              className="w-24 px-5 py-3.5 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none font-black text-center shadow-sm"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            />
          </div>
          <button 
            onClick={handleCreate}
            disabled={!title || selectedIds.size === 0}
            className="self-end px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-indigo-100 transition-all flex items-center gap-2 active:scale-95"
          >
            {isEdit ? 'Lưu bài thi' : 'Tạo bài thi'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h3 className="text-xl font-black text-gray-900">Lựa chọn câu hỏi</h3>
            <p className="text-gray-400 text-xs font-medium mt-1">
              Đã chọn <span className="text-indigo-600 font-black">{selectedIds.size}</span> / {questions.length} câu
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest hidden sm:block">Số câu ngẫu nhiên:</span>
            <input 
              type="number" 
              className="w-16 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none font-bold text-center text-sm"
              value={randomCount}
              onChange={(e) => setRandomCount(parseInt(e.target.value) || 0)}
            />
            <button 
              onClick={selectRandomSmart} 
              className="text-white px-5 py-2 rounded-xl bg-indigo-600 font-black text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 active:scale-95"
            >
              CHỌN NHANH
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-gray-400 px-4 py-2 rounded-xl hover:bg-gray-200 font-black text-xs transition-colors"
            >
              XÓA HẾT
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
          {questions.length === 0 ? (
            <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
               <i className="fas fa-database text-4xl text-gray-200 mb-4"></i>
               <p className="text-gray-400 font-bold">Ngân hàng câu hỏi đang trống.</p>
            </div>
          ) : (
            questions.map((q) => (
              <div 
                key={q.id}
                onClick={() => toggleSelection(q.id)}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-start gap-4 group ${
                  selectedIds.has(q.id) 
                  ? 'border-indigo-600 bg-indigo-50/50' 
                  : 'border-gray-50 bg-gray-50 hover:border-indigo-100'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                  selectedIds.has(q.id) ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white group-hover:border-indigo-300'
                }`}>
                  {selectedIds.has(q.id) && <i className="fas fa-check text-[10px] text-white"></i>}
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">{q.text}</p>
                  <div className="flex gap-2 mt-3 items-center">
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                      q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {q.difficulty}
                    </span>
                    {q.seenCount > 0 && <span className="text-[8px] font-black text-green-600 uppercase tracking-tighter">Đã thuộc</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
