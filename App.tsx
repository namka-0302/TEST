
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { db } from './services/dbService';
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
  const [loading, setLoading] = useState(true);
  
  const lastSyncRef = useRef<number>(0);

  const syncData = useCallback(async () => {
    // Chống spam sync quá dày đặc
    if (Date.now() - lastSyncRef.current < 2000) return;
    lastSyncRef.current = Date.now();

    try {
      const [qData, quizData, resData, accData] = await Promise.all([
        db.getQuestions(),
        db.getQuizzes(),
        db.getResults(),
        db.getAccounts()
      ]);

      setQuestions(qData.length > 0 ? qData : (db.isCloud ? [] : SEED_QUESTIONS));
      setQuizzes(quizData);
      setResults(resData);
      setAccounts(accData.length > 0 ? accData : (db.isCloud ? [] : DEFAULT_ACCOUNTS));

      const savedUser = localStorage.getItem('quizmaster_user');
      if (savedUser && !user) setUser(JSON.parse(savedUser));
      
      setLoading(false);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    syncData();

    // Đồng bộ Local Storage (cho nhiều tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('quizmaster_')) syncData();
    };
    window.addEventListener('storage', handleStorageChange);

    // Đồng bộ Cloud (Long Polling)
    const syncInterval = setInterval(syncData, 15000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
    };
  }, [syncData]);

  const addQuestions = async (newQs: Question[]) => {
    const updated = [...newQs, ...questions];
    setQuestions(updated);
    await db.saveQuestions(updated);
  };

  const updateQuestion = async (updatedQ: Question) => {
    const updated = questions.map(q => q.id === updatedQ.id ? updatedQ : q);
    setQuestions(updated);
    await db.saveQuestions(updated);
  };

  const updateQuestionSeen = async (ids: string[]) => {
    const updated = questions.map(q => 
      ids.includes(q.id) ? { ...q, seenCount: q.seenCount + 1 } : q
    );
    setQuestions(updated);
    await db.saveQuestions(updated);
  };

  const deleteQuestion = async (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    await db.saveQuestions(updated);
  };

  const addQuiz = async (quiz: Quiz) => {
    const updated = [quiz, ...quizzes];
    setQuizzes(updated);
    await db.saveQuizzes(updated);
  };

  const updateQuiz = async (updatedQuiz: Quiz) => {
    const updated = quizzes.map(q => q.id === updatedQuiz.id ? updatedQuiz : q);
    setQuizzes(updated);
    await db.saveQuizzes(updated);
  };

  const deleteQuiz = async (id: string) => {
    const updated = quizzes.filter(q => q.id !== id);
    setQuizzes(updated);
    await db.deleteQuiz(id);
  };

  const saveResult = async (result: QuizResult) => {
    setResults(prev => [result, ...prev]);
    await db.addResult(result);
  };

  const handleLogin = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem('quizmaster_user', JSON.stringify(u));
    else localStorage.removeItem('quizmaster_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-900 text-white">
        <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
           <i className="fas fa-graduation-cap text-3xl"></i>
        </div>
        <h2 className="text-lg font-black tracking-tight">QuizMaster AI</h2>
        <p className="text-indigo-300 text-xs mt-2">Đang kết nối Cloud Sync...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} accounts={accounts} onRegister={async (acc) => {
      const updated = [...accounts, acc];
      setAccounts(updated);
      await db.saveAccount(acc);
    }} />;
  }

  const isAdmin = user.role === 'Admin';

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-50/50">
        <Navbar user={user} onLogout={() => handleLogin(null)} isCloud={db.isCloud} />
        
        <main className="flex-grow container mx-auto px-4 py-6">
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
            
            {/* Review Mode Route: Reuse QuizTake component for reviewing past results */}
            <Route path="/quiz-review/:id" element={<QuizTake quizzes={quizzes} user={user} isReviewMode={true} allResults={results} />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
