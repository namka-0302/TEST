
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
import QuizHistory from './components/QuizHistory';
import MockExam from './components/MockExam';
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
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const lastSyncRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);

  const syncData = useCallback(async (isInitial = false) => {
    if (isUpdatingRef.current) return;
    if (!isInitial && Date.now() - lastSyncRef.current < 5000) return;
    
    setIsSyncing(true);
    lastSyncRef.current = Date.now();

    try {
      if (isInitial) await db.checkConnection();

      const [qData, quizData, resData, accData] = await Promise.all([
        db.getQuestions(),
        db.getQuizzes(),
        db.getResults(),
        db.getAccounts()
      ]);

      if (qData !== null) {
        if (db.isCloud) {
          setQuestions(qData);
        } else {
          setQuestions(qData.length > 0 ? qData : SEED_QUESTIONS);
        }
      }
      
      if (quizData !== null) setQuizzes(quizData);
      if (resData !== null) setResults(resData);
      if (accData !== null) setAccounts(accData.length > 0 ? accData : DEFAULT_ACCOUNTS);

      const savedUser = localStorage.getItem('quizmaster_user');
      if (savedUser && !user) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Tải tiến độ ngay khi nhận diện được user
        const progress = await db.getUserProgress(parsedUser.id);
        setUserProgress(progress);
      } else if (user) {
        const progress = await db.getUserProgress(user.id);
        setUserProgress(progress);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
      setLoading(false);
    } finally {
      setTimeout(() => setIsSyncing(false), 1000);
    }
  }, [user]);

  useEffect(() => {
    syncData(true);
    const syncInterval = setInterval(() => syncData(), 15000);
    return () => clearInterval(syncInterval);
  }, [syncData]);

  const safeUpdate = async (updateFn: () => Promise<void>) => {
    isUpdatingRef.current = true;
    try {
      await updateFn();
      lastSyncRef.current = 0;
      await syncData();
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 1000);
    }
  };

  const addQuestions = async (newQs: Question[]) => {
    await safeUpdate(async () => {
      const updated = [...newQs, ...questions];
      setQuestions(updated);
      await db.saveQuestions(updated);
    });
  };

  const updateQuestion = async (updatedQ: Question) => {
    await safeUpdate(async () => {
      const updated = questions.map(q => q.id === updatedQ.id ? updatedQ : q);
      setQuestions(updated);
      await db.saveQuestions(updated);
    });
  };

  const updateQuestionSeen = async (ids: string[]) => {
    if (ids.length === 0 || !user) return;
    await safeUpdate(async () => {
      const newProgress = { ...userProgress };
      ids.forEach(id => {
        newProgress[id] = (newProgress[id] || 0) + 1;
      });
      setUserProgress(newProgress);
      await db.saveUserProgress(user.id, newProgress);
    });
  };

  const deleteQuestion = async (id: string) => {
    await safeUpdate(async () => {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      await db.saveQuestions(updated);
    });
  };

  const addQuiz = async (quiz: Quiz) => {
    await safeUpdate(async () => {
      const updated = [quiz, ...quizzes];
      setQuestions(prev => prev); // Dummy update to trigger re-renders if needed
      setQuizzes(updated);
      await db.saveQuizzes(updated);
    });
  };

  const updateQuiz = async (updatedQuiz: Quiz) => {
    await safeUpdate(async () => {
      const updated = quizzes.map(q => q.id === updatedQuiz.id ? updatedQuiz : q);
      setQuizzes(updated);
      await db.saveQuizzes(updated);
    });
  };

  const deleteQuiz = async (id: string) => {
    await safeUpdate(async () => {
      const updated = quizzes.filter(q => q.id !== id);
      setQuizzes(updated);
      await db.deleteQuiz(id);
    });
  };

  const saveResult = async (result: QuizResult) => {
    await safeUpdate(async () => {
      setResults(prev => [result, ...prev]);
      await db.addResult(result);
    });
  };

  const handleLogin = async (u: User | null) => {
    if (u) {
      localStorage.setItem('quizmaster_user', JSON.stringify(u));
      const progress = await db.getUserProgress(u.id);
      setUserProgress(progress);
      setUser(u);
      syncData(true);
    } else {
      localStorage.removeItem('quizmaster_user');
      setUser(null);
      setUserProgress({});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a1a] text-white p-6">
        <div className="relative">
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mb-8 animate-float shadow-[0_0_50px_rgba(79,70,229,0.3)]">
             <i className="fas fa-graduation-cap text-4xl"></i>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#0a0a1a] animate-pulse"></div>
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-2">QuizMaster AI</h2>
        <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px]">Verifying Identity</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} accounts={accounts} onRegister={async (acc) => {
      await safeUpdate(async () => {
        const updated = [...accounts, acc];
        setAccounts(updated);
        await db.saveAccount(acc);
      });
    }} />;
  }

  const isAdmin = user.role === 'Admin';

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-gray-50/30">
        <Navbar user={user} onLogout={() => handleLogin(null)} isCloud={db.isCloud} isSyncing={isSyncing} />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard user={user} questions={questions} quizzes={quizzes} accounts={accounts} results={results} userProgress={userProgress} onDeleteQuiz={deleteQuiz} onManualSync={() => syncData(true)} />} />
            
            {isAdmin && (
              <>
                <Route path="/upload" element={<UploadView onAddQuestions={addQuestions} questions={questions} />} />
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

            <Route path="/learn" element={<LearningMode questions={questions} userProgress={userProgress} onMarkSeen={(id) => updateQuestionSeen([id])} />} />
            <Route path="/mock-exam" element={<MockExam questions={questions} user={user} onComplete={(ids, result) => {
              updateQuestionSeen(ids);
              if (result) saveResult(result);
            }} />} />
            <Route path="/my-history" element={<QuizHistory user={user} results={results} />} />
            <Route path="/quiz/:id" element={<QuizTake quizzes={quizzes} user={user} onComplete={(ids, result) => {
              updateQuestionSeen(ids);
              if (result) saveResult(result);
            }} />} />
            
            <Route path="/quiz-review/:id" element={<QuizTake quizzes={quizzes} user={user} questions={questions} isReviewMode={true} allResults={results} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
