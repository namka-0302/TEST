
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import UploadView from './components/UploadView';
import QuestionBank from './components/QuestionBank';
import QuizCreator from './components/QuizCreator';
import QuizTake from './components/QuizTake';
import LearningMode from './components/LearningMode';
import QuestionManualAdd from './components/QuestionManualAdd';
import StudentManagement from './components/StudentManagement';
import SystemHistory from './components/SystemHistory';
import QuizManagement from './components/QuizManagement';
import Login from './components/Login';
import { Question, Quiz, User, Account, QuizResult } from './types';
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
  const [results, setResults] = useState<QuizResult[]>([]);

  const loadInitialData = useCallback(() => {
    const savedQuestions = localStorage.getItem('quizmaster_questions');
    const savedQuizzes = localStorage.getItem('quizmaster_quizzes');
    const savedUser = localStorage.getItem('quizmaster_user');
    const savedAccounts = localStorage.getItem('quizmaster_accounts');
    const savedResults = localStorage.getItem('quizmaster_results');
    
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions));
    } else {
      setQuestions(SEED_QUESTIONS);
      localStorage.setItem('quizmaster_questions', JSON.stringify(SEED_QUESTIONS));
    }

    setQuizzes(savedQuizzes ? JSON.parse(savedQuizzes) : []);
    setResults(savedResults ? JSON.parse(savedResults) : []);
    if (savedUser) setUser(JSON.parse(savedUser));
    
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    } else {
      setAccounts(DEFAULT_ACCOUNTS);
      localStorage.setItem('quizmaster_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('quizmaster_')) {
        loadInitialData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadInitialData]);

  useEffect(() => {
    localStorage.setItem('quizmaster_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('quizmaster_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('quizmaster_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    if (user) localStorage.setItem('quizmaster_user', JSON.stringify(user));
    else localStorage.removeItem('quizmaster_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('quizmaster_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const addQuestions = (newQuestions: Question[]) => {
    setQuestions(prev => [...newQuestions, ...prev]);
  };

  const updateQuestion = (updatedQ: Question) => {
    setQuestions(prev => prev.map(q => q.id === updatedQ.id ? updatedQ : q));
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

  const updateQuiz = (updatedQuiz: Quiz) => {
    setQuizzes(prev => prev.map(q => q.id === updatedQuiz.id ? updatedQuiz : q));
  };

  const deleteQuiz = (id: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const saveResult = (result: QuizResult) => {
    setResults(prev => [result, ...prev]);
  };

  if (!user) {
    return <Login onLogin={setUser} accounts={accounts} onRegister={(acc) => setAccounts(prev => [...prev, acc])} />;
  }

  const isAdmin = user.role === 'Admin';

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-50/50">
        <div className="h-[env(safe-area-inset-top)] bg-white sticky top-0 z-[110]"></div>
        <Navbar user={user} onLogout={() => setUser(null)} />
        
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
          <Routes>
            <Route path="/" element={<Dashboard user={user} questions={questions} quizzes={quizzes} accounts={accounts} results={results} onDeleteQuiz={deleteQuiz} />} />
            
            {isAdmin && (
              <>
                <Route path="/upload" element={<UploadView onAddQuestions={addQuestions} />} />
                <Route path="/manual-add" element={<QuestionManualAdd onAddQuestion={(q) => addQuestions([q])} />} />
                <Route path="/edit-question/:id" element={<QuestionManualAdd questions={questions} onAddQuestion={updateQuestion} isEdit={true} />} />
                <Route path="/bank" element={<QuestionBank questions={questions} onDeleteQuestion={deleteQuestion} />} />
                <Route path="/quizzes" element={<QuizManagement quizzes={quizzes} onDeleteQuiz={deleteQuiz} />} />
                <Route path="/create-quiz" element={<QuizCreator questions={questions} onSaveQuiz={addQuiz} quizzes={quizzes} />} />
                <Route path="/edit-quiz/:id" element={<QuizCreator questions={questions} onSaveQuiz={updateQuiz} quizzes={quizzes} isEdit={true} />} />
                <Route path="/students" element={<StudentManagement accounts={accounts} results={results} questionsCount={questions.length} />} />
                <Route path="/history" element={<SystemHistory results={results} />} />
              </>
            )}

            <Route path="/learn" element={<LearningMode questions={questions} onMarkSeen={(id) => updateQuestionSeen([id])} />} />
            <Route path="/quiz/:id" element={<QuizTake quizzes={quizzes} user={user} onComplete={(ids, result) => {
              updateQuestionSeen(ids);
              if (result) saveResult(result);
            }} />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-t py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center text-gray-400 text-[10px] uppercase tracking-widest font-black">
          <div className="container mx-auto">
            <p className="mb-1 text-gray-500">QuizMaster AI System</p>
            <p>© 2024 - Management Pro v4.5</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
