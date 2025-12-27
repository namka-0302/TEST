
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
    <div className="min-h-screen flex items-center justify-center bg-indigo-600 px-4 py-10">
      {/* Background decoration for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-fadeIn relative z-10">
        
        {/* Left Side: Branding (Desktop Only) */}
        <div className="hidden md:flex flex-col justify-center p-12 bg-indigo-50 text-indigo-900 space-y-8 border-r border-indigo-100">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl rotate-6">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter">QuizMaster <span className="text-indigo-600 underline decoration-indigo-200 decoration-8 underline-offset-4">AI</span></h1>
            <p className="text-xl text-indigo-700/70 font-bold leading-relaxed">
              Giải pháp tối ưu cho Ngân hàng câu hỏi và Hệ thống học tập 4.0.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 pt-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-indigo-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <i className="fas fa-microchip"></i>
              </div>
              <span className="font-black text-sm uppercase tracking-widest text-indigo-900">AI Driven Content</span>
            </div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-indigo-100">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <span className="font-black text-sm uppercase tracking-widest text-indigo-900">Mobile Optimized</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms (Mobile Focused) */}
        <div className="p-6 md:p-12 flex flex-col justify-center">
          {/* Logo for mobile only */}
          <div className="md:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h1 className="text-2xl font-black text-indigo-900 tracking-tight">QuizMaster AI</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {isRegistering ? 'Tạo tài khoản' : 'Xin chào!'}
            </h2>
            <p className="text-gray-500 mt-2 font-medium">
              {isRegistering ? 'Tham gia ngay hôm nay' : 'Đăng nhập để tiếp tục hành trình'}
            </p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                  <input 
                    type="text"
                    required
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-gray-800"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bạn là?</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-gray-800"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="User">Học viên</option>
                    <option value="Admin">Giảng viên / Admin</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên đăng nhập</label>
              <input 
                type="text"
                required
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-gray-800"
                placeholder="admin / user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
              <input 
                type="password"
                required
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50 focus:bg-white focus:border-indigo-600 outline-none transition-all font-bold text-gray-800"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 ${error.includes('thành công') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                <i className="fas fa-info-circle text-base"></i>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 mt-6 active:scale-95"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : null}
              {isRegistering ? 'Bắt đầu ngay' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-bold text-gray-500">
              {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
              <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="ml-2 text-indigo-600 font-black hover:underline"
              >
                {isRegistering ? 'Đăng nhập' : 'Đăng ký ngay'}
              </button>
            </p>
            {/* Quick access info for mobile */}
            {!isRegistering && (
              <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[9px] text-gray-400 font-black uppercase tracking-tighter">
                <span className="bg-gray-50 px-2 py-1 rounded">Admin: admin / 123</span>
                <span className="bg-gray-50 px-2 py-1 rounded">User: user / 123</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
