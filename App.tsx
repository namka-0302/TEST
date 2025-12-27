
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
    if (!isInitial && Date.now() - lastSyncRef.current < 2000) return;
    
    setIsSyncing(true);
    lastSyncRef.current = Date.now();

    try {
      // Đảm bảo db đã check connection xong trước khi sync lần đầu
      if (isInitial) await db.checkConnection();

      const [qData, quizData, resData, accData] = await Promise.all([
        db.getQuestions(),
        db.getQuizzes(),
        db.getResults(),
        db.getAccounts()
      ]);

      // QUAN TRỌNG: Nếu đang ở chế độ Cloud, chúng ta chấp nhận mảng rỗng [] từ server
      // Không tự ý fallback về SEED_QUESTIONS nếu server thực sự không có dữ liệu
      if (qData !== null) {
        if (db.isCloud) {
          setQuestions(qData);
        } else {
          setQuestions(qData.length > 0 ? qData : SEED_QUESTIONS);
        }
      }
      
      if (quizData !== null) setQuizzes(quizData);
      if (resData !== null) setResults(resData);
      
      if (accData !== null) {
        if (db.isCloud) {
          setAccounts(accData.length > 0 ? accData : DEFAULT_ACCOUNTS);
        } else {
          setAccounts(accData.length > 0 ? accData : DEFAULT_ACCOUNTS);
        }
      }

      const savedUser = localStorage.getItem('quizmaster_user');
      if (savedUser && !user) setUser(JSON.parse(savedUser));
      
      setLoading(false);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
      setLoading(false);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  }, [user]);

  useEffect(() => {
    syncData(true);

    const syncInterval = setInterval(() => {
      syncData();
    }, 10000); // 10s một lần để tiết kiệm tài nguyên Cloud

    return () => clearInterval(syncInterval);
  }, [syncData]);

  const safeUpdate = async (updateFn: () => Promise<void>) => {
    isUpdatingRef.current = true;
    try {
      await updateFn();
      lastSyncRef.current = Date.now();
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 3000);
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
      syncData(true); // Sync ngay khi login
    } else {
      localStorage.removeItem('quizmaster_user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-900 text-white p-6">
        <div className="relative">
          <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center mb-8 animate-float">
             <i className="fas fa-graduation-cap text-4xl"></i>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-indigo-900 animate-pulse"></div>
        </div>
        <h2 className="text-2xl font-black tracking-tight">QuizMaster AI</h2>
        <div className="mt-4 flex flex-col items-center">
           <div className="flex gap-1 mb-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
           </div>
           <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">Initial Cloud Syncing</p>
        </div>
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
      <div className="min-h-screen flex flex-col bg-gray-50/50">
        <Navbar user={user} onLogout={() => handleLogin(null)} isCloud={db.isCloud} isSyncing={isSyncing} />
        
        <main className="flex-grow container mx-auto px-4 py-6">
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
