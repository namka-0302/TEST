
import React, { useState } from 'react';
import { User, Account, Role } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  accounts: Account[];
  onRegister: (account: Account) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, accounts, onRegister }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('User');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const account = accounts.find(a => a.username === username && a.password === password);
      if (account) {
        onLogin({
          id: account.id,
          name: account.name,
          role: account.role,
          username: account.username
        });
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác');
        setLoading(false);
      }
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !name) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (accounts.some(a => a.username === username)) {
      setError('Tên đăng nhập đã tồn tại');
      return;
    }

    const newAccount: Account = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password,
      name,
      role
    };

    onRegister(newAccount);
    setIsRegistering(false);
    setError('Đăng ký thành công! Hãy đăng nhập.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-500 px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-indigo-50 text-indigo-900 space-y-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">QuizMaster <span className="text-indigo-600 underline decoration-indigo-200">AI</span></h1>
            <p className="text-lg text-indigo-700/70 mt-4 leading-relaxed">
              Hệ thống quản lý ngân hàng câu hỏi thông minh, tự động phân tích PDF và hỗ trợ học tập cá nhân hóa.
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-indigo-600 font-bold">
              <i className="fas fa-check-circle"></i>
              <span>Tự động hóa bài giảng</span>
            </div>
            <div className="flex items-center gap-3 text-indigo-600 font-bold">
              <i className="fas fa-check-circle"></i>
              <span>Phân tích PDF bằng AI</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900">
              {isRegistering ? 'Tạo tài khoản mới' : 'Chào mừng trở lại!'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isRegistering ? 'Tham gia cộng đồng học tập thông minh' : 'Vui lòng đăng nhập để tiếp tục'}
            </p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Họ và tên</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 outline-none transition-all"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Vai trò</label>
                  <select 
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 outline-none transition-all"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="User">Học viên / Sinh viên</option>
                    <option value="Admin">Giảng viên / Admin</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tên đăng nhập</label>
              <input 
                type="text"
                required
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 outline-none transition-all"
                placeholder="admin / user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">Mật khẩu</label>
              <input 
                type="password"
                required
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 outline-none transition-all"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className={`p-4 rounded-xl text-sm font-medium ${error.includes('thành công') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <i className="fas fa-info-circle mr-2"></i>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : null}
              {isRegistering ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-500">
              {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
              <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="ml-2 text-indigo-600 font-bold hover:underline"
              >
                {isRegistering ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}
              </button>
            </p>
            <div className="mt-4 flex justify-center gap-4 text-xs text-gray-300 font-bold uppercase">
              <span>Admin: admin / 123</span>
              <span className="w-px h-3 bg-gray-200"></span>
              <span>User: user / 123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
