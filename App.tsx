
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import UploadView from './components/UploadView';
import QuestionBank from './components/QuestionBank';
import QuizCreator from './components/QuizCreator';
import QuizTake from './components/QuizTake';
import LearningMode from './components/LearningMode';
import QuestionManualAdd from './components/QuestionManualAdd';
import Login from './components/Login';
import { Question, Quiz, User, Account } from './types';
import { SEED_QUESTIONS } from './data/seedData';

const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', username: 'admin', password: '123', name: 'Quản trị viên', role: 'Admin' },
  { id: '2', username: 'user', password: '123', name: 'Học viên', role: 'User' }
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const savedQuestions = localStorage.getItem('quizmaster_questions');
    const savedQuizzes = localStorage.getItem('quizmaster_quizzes');
    const savedUser = localStorage.getItem('quizmaster_user');
    const savedAccounts = localStorage.getItem('quizmaster_accounts');
    
    // Nạp câu hỏi từ file PDF (seed data) nếu chưa có dữ liệu nào
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    } else {
      setQuestions(SEED_QUESTIONS);
      localStorage.setItem('quizmaster_questions', JSON.stringify(SEED_QUESTIONS));
    }

    if (savedQuizzes) setQuizzes(JSON.parse(savedQuizzes));
    if (savedUser) setUser(JSON.parse(savedUser));
    
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    } else {
      setAccounts(DEFAULT_ACCOUNTS);
      localStorage.setItem('quizmaster_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quizmaster_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('quizmaster_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    if (user) localStorage.setItem('quizmaster_user', JSON.stringify(user));
    else localStorage.removeItem('quizmaster_user');
  }, [user]);

  useEffect(() => {
    if (accounts.length > 0) localStorage.setItem('quizmaster_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const addQuestions = (newQuestions: Question[]) => {
    setQuestions(prev => [...newQuestions, ...prev]);
  };

  const updateQuestionSeen = (questionIds: string[]) => {
    setQuestions(prev => prev.map(q => 
      questionIds.includes(q.id) ? { ...q, seenCount: q.seenCount + 1 } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const addQuiz = (quiz: Quiz) => {
    setQuizzes(prev => [quiz, ...prev]);
  };

  const logout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={setUser} accounts={accounts} onRegister={(acc) => setAccounts(prev => [...prev, acc])} />;
  }

  const isAdmin = user.role === 'Admin';

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-50/50">
        <Navbar user={user} onLogout={logout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard user={user} questions={questions} quizzes={quizzes} />} />
            
            {isAdmin && (
              <>
                <Route path="/upload" element={<UploadView onAddQuestions={addQuestions} />} />
                <Route path="/manual-add" element={<QuestionManualAdd onAddQuestion={(q) => addQuestions([q])} />} />
                <Route path="/bank" element={<QuestionBank questions={questions} onDeleteQuestion={deleteQuestion} />} />
                <Route path="/create-quiz" element={<QuizCreator questions={questions} onSaveQuiz={addQuiz} />} />
              </>
            )}

            <Route path="/learn" element={<LearningMode questions={questions} onMarkSeen={(id) => updateQuestionSeen([id])} />} />
            <Route path="/quiz/:id" element={<QuizTake quizzes={quizzes} onComplete={(ids) => updateQuestionSeen(ids)} />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-white border-t py-8 text-center text-gray-400 text-xs">
          <div className="container mx-auto">
            <p className="mb-2 font-bold text-gray-500">QuizMaster AI System</p>
            <p>© 2024 - Enterprise Edition v3.0. Powered by Gemini Flash.</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
