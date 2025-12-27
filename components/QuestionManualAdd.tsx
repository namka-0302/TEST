
import React, { useState } from 'react';
import { Question, Choice } from '../types';

interface QuestionManualAddProps {
  onAddQuestion: (question: Question) => void;
}

const QuestionManualAdd: React.FC<QuestionManualAddProps> = ({ onAddQuestion }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || choices.some(c => !c.text)) {
      setMessage('Please fill all fields');
      return;
    }

    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      difficulty,
      choices: [...choices],
      explanation,
      createdAt: Date.now(),
      seenCount: 0
    };

    onAddQuestion(newQuestion);
    setText('');
    setExplanation('');
    setChoices(choices.map(c => ({ ...c, text: '' })));
    setMessage('Question added successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const updateChoiceText = (id: string, newText: string) => {
    setChoices(prev => prev.map(c => c.id === id ? { ...c, text: newText } : c));
  };

  const setCorrect = (id: string) => {
    setChoices(prev => prev.map(c => ({ ...c, isCorrect: c.id === id })));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Manual Question Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase">Question Text</label>
            <textarea 
              className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 h-32"
              placeholder="What is the capital of France?"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase">Difficulty</label>
              <select 
                className="w-full p-3 rounded-xl border border-gray-200"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="space-y-2">
               <label className="text-sm font-bold text-gray-500 uppercase">Correct Answer Label</label>
               <div className="flex gap-2 h-12">
                  {choices.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCorrect(c.id)}
                      className={`flex-grow rounded-xl font-bold border-2 transition-all ${
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
            <label className="text-sm font-bold text-gray-500 uppercase">Option Details</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {choices.map(c => (
                <div key={c.id} className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300">{c.label}</span>
                  <input 
                    type="text"
                    placeholder={`Option ${c.label}`}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200"
                    value={c.text}
                    onChange={(e) => updateChoiceText(c.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase">Explanation (Optional)</label>
            <input 
              type="text"
              placeholder="Why is this answer correct?"
              className="w-full p-4 rounded-xl border border-gray-200"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            {message && <span className="text-green-600 font-bold text-sm">{message}</span>}
            <button 
              type="submit"
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 ml-auto"
            >
              Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionManualAdd;
