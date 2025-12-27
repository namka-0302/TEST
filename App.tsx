
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
  const [isSyncing, setIsSyncing] = useState(false);
  
  const lastSyncRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);

  const syncData = useCallback(async (isInitial = false) => {
    if (isUpdatingRef.current) return;
    // Tăng thời gian giãn cách sync để mượt mà hơn
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

      // Logic đồng bộ thông minh:
      // Nếu là Cloud, ưu tiên tuyệt đối dữ liệu từ Cloud (kể cả rỗng)
      // Nếu là Local, dùng Local hoặc Seed nếu trống
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
      if (savedUser && !user) setUser(JSON.parse(savedUser));
      
      setLoading(false);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
      setLoading(false);
    } finally {
      // Giữ trạng thái syncing thêm một chút để UI ổn định
      setTimeout(() => setIsSyncing(false), 1500);
    }
  }, [user]);

  useEffect(() => {
    syncData(true);

    const syncInterval = setInterval(() => {
      syncData();
    }, 15000); // 15s cho cloud sync ngầm

    return () => clearInterval(syncInterval);
  }, [syncData]);

  const safeUpdate = async (updateFn: () => Promise<void>) => {
    isUpdatingRef.current = true;
    try {
      await updateFn();
      // Sync ngay lập tức sau khi update
      lastSyncRef.current = 0;
      await syncData();
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 2000);
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
    if (ids.length === 0) return;
    await safeUpdate(async () => {
      const updated = questions.map(q => 
        ids.includes(q.id) ? { ...q, seenCount: q.seenCount + 1 } : q
      );
      setQuestions(updated);
      await db.saveQuestions(updated);
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

  const handleLogin = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('quizmaster_user', JSON.stringify(u));
      syncData(true);
    } else {
      localStorage.removeItem('quizmaster_user');
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
        <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[10px]">Cloud Syncing Data</p>
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
            <Route path="/" element={<Dashboard user={user} questions={questions} quizzes={quizzes} accounts={accounts} results={results} onDeleteQuiz={deleteQuiz} onManualSync={() => syncData(true)} />} />
            
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
              const correctQuestionIds = result ? Object.keys(result.answers).filter(qId => {
                const q = questions.find(item => item.id === qId);
                const correctChoice = q?.choices.find(c => c.isCorrect);
                return result.answers[qId] === correctChoice?.id;
              }) : [];
              updateQuestionSeen(correctQuestionIds);
              if (result) saveResult(result);
            }} />} />
            
            <Route path="/quiz-review/:id" element={<QuizTake quizzes={quizzes} user={user} isReviewMode={true} allResults={results} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
