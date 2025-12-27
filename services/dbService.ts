
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
      // Kiểm tra xem API Serverless có phản hồi không
      const res = await fetch(`${this.apiPath}/health`);
      if (res.ok) {
        const data = await res.json();
        // Nếu API trả về provider là Vercel, nghĩa là KV đã được kết nối
        if (data.provider === 'Vercel') {
          this.connectionType = 'Vercel';
          this.isCloud = true;
          console.log("🌐 QuizMaster Cloud: Upstash Redis Connected");
        }
      }
    } catch (e) {
      this.connectionType = 'Local';
      this.isCloud = false;
      console.warn("🏠 QuizMaster Local: Running without Database (Offline)");
    }
  }

  private async request(path: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${this.apiPath}${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`API Error (${path}):`, errorData);
        return null;
      }
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
    const success = await this.request('/questions', {
      method: 'POST',
      body: JSON.stringify({ questions }),
    });
    // Lưu backup local
    localStorage.setItem('quizmaster_questions', JSON.stringify(questions));
    window.dispatchEvent(new StorageEvent('storage', { key: 'quizmaster_questions' }));
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
    window.dispatchEvent(new StorageEvent('storage', { key: 'quizmaster_quizzes' }));
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
    window.dispatchEvent(new StorageEvent('storage', { key: 'quizmaster_results' }));
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
    window.dispatchEvent(new StorageEvent('storage', { key: 'quizmaster_accounts' }));
  }

  subscribe(table: string, callback: () => void) {
    if (this.connectionType === 'Local') return null;
    // Cơ chế Long Polling: Tự động cập nhật sau mỗi 10 giây để đảm bảo máy học sinh thấy câu hỏi mới
    const interval = setInterval(callback, 10000);
    return { unsubscribe: () => clearInterval(interval) };
  }
}

export const db = new DatabaseService();
