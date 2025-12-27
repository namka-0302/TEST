
import React, { useState, useEffect, useRef } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isEdit && id && !hasInitialized.current) {
      const existingQuiz = quizzes.find(q => q.id === id);
      if (existingQuiz) {
        setTitle(existingQuiz.title);
        setDuration(existingQuiz.durationMinutes);
        setSelectedIds(new Set(existingQuiz.questions.map(q => q.id)));
        hasInitialized.current = true;
      }
    }
  }, [id, isEdit, quizzes]);

  const toggleSelection = (qId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(qId)) newSet.delete(qId);
    else newSet.add(qId);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(questions.map(q => q.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
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

  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Logic Random mới: Đảm bảo lấy đúng và đủ số lượng
  const selectRandomSmart = () => {
    const limit = Math.min(randomCount, questions.length);
    if (limit <= 0) return;
    
    // 1. Trộn ngẫu nhiên toàn bộ danh sách để đảm bảo tính bất ngờ
    const shuffled = shuffleArray(questions);
    
    // 2. Sắp xếp để ưu tiên những câu có seenCount thấp hơn (chưa học/ít học)
    // Dùng stable sort của JS để vẫn giữ được tính ngẫu nhiên của các câu có cùng seenCount
    const prioritized = shuffled.sort((a, b) => (a.seenCount || 0) - (b.seenCount || 0));
    
    // 3. Lấy chính xác 'limit' câu đầu tiên
    const selected = prioritized.slice(0, limit).map(q => q.id);
    
    setSelectedIds(new Set(selected));
    
    // Thông báo cho người dùng biết đã chọn bao nhiêu
    console.log(`Đã chọn ngẫu nhiên ${selected.length} câu hỏi.`);
  };

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-24 px-1 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {isEdit ? 'Chỉnh sửa bài thi' : 'Thiết kế bài thi mới'}
          </h1>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tiêu đề bài kiểm tra</label>
            <input 
              type="text" 
              placeholder="Ví dụ: Kiểm tra cuối kỳ môn Toán" 
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-white focus:border-indigo-600 outline-none transition-all font-bold shadow-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Thời gian (Phút)</label>
            <input 
              type="number" 
              className="w-28 px-4 py-4 rounded-2xl border-2 border-gray-50 bg-white focus:border-indigo-600 outline-none font-black text-center shadow-sm"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
            />
          </div>
          <button 
            onClick={handleCreate}
            disabled={!title || selectedIds.size === 0}
            className="flex-grow md:flex-grow-0 self-end px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-30 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            {isEdit ? 'LƯU THAY ĐỔI' : 'XUẤT BẢN BÀI THI'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-8 md:p-10 border-b border-gray-50 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-black text-gray-900">Ngân hàng câu hỏi chọn lọc</h3>
              <p className="text-gray-400 text-xs font-medium mt-1">
                Lựa chọn từ <span className="text-indigo-600 font-black">{questions.length}</span> câu có sẵn. Đang chọn: <span className="text-indigo-600 font-black">{selectedIds.size}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Số câu ngẫu nhiên:</span>
                <input 
                  type="number" 
                  className="w-14 bg-transparent focus:outline-none font-black text-indigo-900 text-sm"
                  value={randomCount}
                  onChange={(e) => setRandomCount(parseInt(e.target.value) || 0)}
                />
                <button 
                  onClick={selectRandomSmart} 
                  className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl font-black text-[10px] hover:bg-indigo-700 transition-all active:scale-90"
                >
                  CHỌN NHANH
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase">Tất cả</button>
                <div className="w-px h-3 bg-gray-200"></div>
                <button onClick={deselectAll} className="text-[10px] font-black text-gray-400 hover:text-red-600 uppercase">Xóa hết</button>
              </div>
            </div>
          </div>

          <div className="relative">
             <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-300"></i>
             <input 
              type="text"
              placeholder="Tìm kiếm câu hỏi trong danh sách..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-600/20 outline-none font-medium text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredQuestions.length === 0 ? (
            <div className="col-span-2 py-20 text-center space-y-4">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200 text-2xl">
                 <i className="fas fa-search"></i>
               </div>
               <p className="text-gray-400 font-bold">Không tìm thấy câu hỏi phù hợp.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div 
                key={q.id}
                onClick={() => toggleSelection(q.id)}
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-start gap-4 group relative overflow-hidden ${
                  selectedIds.has(q.id) 
                  ? 'border-indigo-600 bg-indigo-50/30' 
                  : 'border-gray-50 bg-gray-50 hover:border-indigo-200 hover:bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                  selectedIds.has(q.id) ? 'border-indigo-600 bg-indigo-600' : 'border-gray-200 bg-white group-hover:border-indigo-400'
                }`}>
                  {selectedIds.has(q.id) && <i className="fas fa-check text-[10px] text-white"></i>}
                </div>
                <div className="flex-grow space-y-3">
                  <p className="text-sm font-bold text-gray-800 leading-snug group-hover:text-gray-900">{q.text}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                      q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      q.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {q.difficulty}
                    </span>
                    {q.seenCount > 0 ? (
                      <span className="text-[8px] font-black text-green-600 uppercase flex items-center gap-1">
                        <i className="fas fa-check-circle"></i> Đã thuộc ({q.seenCount})
                      </span>
                    ) : (
                      <span className="text-[8px] font-black text-gray-300 uppercase">Mới</span>
                    )}
                  </div>
                </div>
                {selectedIds.has(q.id) && (
                  <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-indigo-600/5 rounded-full"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCreator;
