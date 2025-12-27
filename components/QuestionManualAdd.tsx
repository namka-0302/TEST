
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Question, Choice } from '../types';

interface QuestionManualAddProps {
  onAddQuestion: (question: Question) => void;
  questions?: Question[];
  isEdit?: boolean;
}

const QuestionManualAdd: React.FC<QuestionManualAddProps> = ({ onAddQuestion, questions, isEdit }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [text, setText] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [choices, setChoices] = useState<Choice[]>([
    { id: '1', label: 'A', text: '', isCorrect: true },
    { id: '2', label: 'B', text: '', isCorrect: false },
    { id: '3', label: 'C', text: '', isCorrect: false },
    { id: '4', label: 'D', text: '', isCorrect: false },
  ]);
  const [explanation, setExplanation] = useState('');
  const [message, setMessage] = useState('');

  // Load data if editing
  useEffect(() => {
    if (isEdit && id && questions) {
      const q = questions.find(item => item.id === id);
      if (q) {
        setText(q.text);
        setDifficulty(q.difficulty);
        setChoices(q.choices);
        setExplanation(q.explanation || '');
      }
    }
  }, [id, isEdit, questions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || choices.some(c => !c.text)) {
      setMessage('Vui lòng điền đầy đủ các trường nội dung');
      return;
    }

    const newQuestion: Question = {
      id: isEdit && id ? id : Math.random().toString(36).substr(2, 9),
      text,
      difficulty,
      choices: [...choices],
      explanation,
      createdAt: isEdit && id ? (questions?.find(q => q.id === id)?.createdAt || Date.now()) : Date.now(),
      seenCount: isEdit && id ? (questions?.find(q => q.id === id)?.seenCount || 0) : 0
    };

    onAddQuestion(newQuestion);
    
    if (isEdit) {
      navigate('/bank');
    } else {
      setText('');
      setExplanation('');
      setChoices(choices.map(c => ({ ...c, text: '' })));
      setMessage('Đã thêm câu hỏi thành công!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateChoiceText = (choiceId: string, newText: string) => {
    setChoices(prev => prev.map(c => c.id === choiceId ? { ...c, text: newText } : c));
  };

  const setCorrect = (choiceId: string) => {
    setChoices(prev => prev.map(c => ({ ...c, isCorrect: c.id === choiceId })));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn pb-20 px-1 md:px-0">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-8">
          {isEdit ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nội dung câu hỏi</label>
            <textarea 
              className="w-full p-6 rounded-[2rem] border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-800 min-h-[120px]"
              placeholder="Nhập nội dung câu hỏi tại đây..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Độ khó</label>
              <select 
                className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none font-bold"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <option value="Easy">Dễ (Easy)</option>
                <option value="Medium">Trung bình (Medium)</option>
                <option value="Hard">Khó (Hard)</option>
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chọn đáp án đúng</label>
               <div className="flex gap-2 h-12">
                  {choices.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCorrect(c.id)}
                      className={`flex-grow rounded-xl font-black border-2 transition-all ${
                        c.isCorrect ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-100 bg-gray-50 text-gray-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nội dung các lựa chọn</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {choices.map(c => (
                <div key={c.id} className="relative group">
                  <span className={`absolute left-5 top-1/2 -translate-y-1/2 font-black text-lg ${c.isCorrect ? 'text-green-600' : 'text-gray-300'}`}>
                    {c.label}
                  </span>
                  <input 
                    type="text"
                    placeholder={`Đáp án ${c.label}...`}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all font-bold outline-none ${
                      c.isCorrect ? 'border-green-600 bg-green-50/30' : 'border-gray-50 bg-gray-50 focus:bg-white group-hover:border-gray-200'
                    }`}
                    value={c.text}
                    onChange={(e) => updateChoiceText(c.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Giải thích đáp án (Nếu có)</label>
            <input 
              type="text"
              placeholder="Vì sao đáp án này đúng?"
              className="w-full p-4 rounded-2xl border border-gray-50 bg-gray-50 focus:bg-white outline-none font-medium italic"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            {message && <span className="text-green-600 font-black text-sm animate-pulse">{message}</span>}
            <div className="flex gap-3 ml-auto">
              <button 
                type="button"
                onClick={() => navigate(isEdit ? '/bank' : '/')}
                className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                {isEdit ? 'Lưu thay đổi' : 'Thêm vào ngân hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionManualAdd;
