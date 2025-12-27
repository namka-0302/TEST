
import { Question, Quiz, QuizResult, Account } from '../types';

class DatabaseService {
  public isCloud: boolean = false;
  public connectionType: 'Vercel' | 'Local' = 'Local';
  private apiPath = '/api';

  constructor() {
    this.checkConnection();
  }

  async checkConnection() {
    try {
      const res = await fetch(`${this.apiPath}/health`);
      if (res.ok) {
        const data = await res.json();
        if (data.provider === 'Vercel') {
          this.connectionType = 'Vercel';
          this.isCloud = true;
          console.log("🌐 QuizMaster Cloud Connected");
        }
      }
    } catch (e) {
      this.connectionType = 'Local';
      this.isCloud = false;
    }
  }

  private async request(path: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.apiPath}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  async getQuestions(): Promise<Question[]> {
    const data = await this.request('/questions');
    if (data) return data;
    const saved = localStorage.getItem('quizmaster_questions');
    return saved ? JSON.parse(saved) : [];
  }

  async saveQuestions(questions: Question[]): Promise<void> {
    await this.request('/questions', {
      method: 'POST',
      body: JSON.stringify({ questions }),
    });
    localStorage.setItem('quizmaster_questions', JSON.stringify(questions));
  }

  // TIẾN ĐỘ CÁ NHÂN (User Progress)
  async getUserProgress(userId: string): Promise<Record<string, number>> {
    const data = await this.request(`/progress?userId=${userId}`);
    if (data) return data;
    const saved = localStorage.getItem(`quizmaster_progress_${userId}`);
    return saved ? JSON.parse(saved) : {};
  }

  async saveUserProgress(userId: string, progress: Record<string, number>): Promise<void> {
    await this.request('/progress', {
      method: 'POST',
      body: JSON.stringify({ userId, progress }),
    });
    localStorage.setItem(`quizmaster_progress_${userId}`, JSON.stringify(progress));
  }

  async getQuizzes(): Promise<Quiz[]> {
    const data = await this.request('/quizzes');
    if (data) return data;
    const saved = localStorage.getItem('quizmaster_quizzes');
    return saved ? JSON.parse(saved) : [];
  }

  async saveQuizzes(quizzes: Quiz[]): Promise<void> {
    await this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify({ quizzes }),
    });
    localStorage.setItem('quizmaster_quizzes', JSON.stringify(quizzes));
  }

  async deleteQuiz(id: string): Promise<void> {
    const quizzes = await this.getQuizzes();
    const updated = quizzes.filter(q => q.id !== id);
    await this.saveQuizzes(updated);
  }

  async getResults(): Promise<QuizResult[]> {
    const data = await this.request('/results');
    if (data) return data;
    const saved = localStorage.getItem('quizmaster_results');
    return saved ? JSON.parse(saved) : [];
  }

  async addResult(result: QuizResult): Promise<void> {
    await this.request('/results', {
      method: 'POST',
      body: JSON.stringify(result),
    });
    const results = await this.getResults();
    localStorage.setItem('quizmaster_results', JSON.stringify([result, ...results]));
  }

  async getAccounts(): Promise<Account[]> {
    const data = await this.request('/accounts');
    if (data) return data;
    const saved = localStorage.getItem('quizmaster_accounts');
    return saved ? JSON.parse(saved) : [];
  }

  async saveAccount(account: Account): Promise<void> {
    const accounts = await this.getAccounts();
    const updated = [...accounts.filter(a => a.id !== account.id), account];
    await this.request('/accounts', {
      method: 'POST',
      body: JSON.stringify({ accounts: updated }),
    });
    localStorage.setItem('quizmaster_accounts', JSON.stringify(updated));
  }
}

export const db = new DatabaseService();
