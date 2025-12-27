
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  isCloud?: boolean;
  isSyncing?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, isCloud, isSyncing }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = user.role === 'Admin';

  const navItems = isAdmin ? [
    { name: 'Dashboard', path: '/', icon: 'fa-house' },
    { name: 'Ngân hàng', path: '/bank', icon: 'fa-database' },
    { name: 'Bài thi', path: '/quizzes', icon: 'fa-clipboard-list' },
    { name: 'Học viên', path: '/students', icon: 'fa-user-graduate' },
    { name: 'Hệ thống', path: '/history', icon: 'fa-clock-rotate-left' },
  ] : [
    { name: 'Trang chủ', path: '/', icon: 'fa-house' },
    { name: 'Ôn tập', path: '/learn', icon: 'fa-book-open' },
    { name: 'Thi thử', path: '/mock-exam', icon: 'fa-vial' },
    { name: 'Lịch sử thi', path: '/my-history', icon: 'fa-clock-rotate-left' },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200/50 safe-padding-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group" onClick={() => setIsMenuOpen(false)}>
          <div className="bg-indigo-600 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-200 group-active:scale-95 transition-all">
            <i className="fas fa-graduation-cap text-white text-lg sm:text-xl"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">QuizMaster</span>
            <span className="text-[10px] font-black text-indigo-500 tracking-[0.2em] uppercase mt-1">AI-Powered</span>
          </div>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                location.pathname === item.path ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <i className={`fas ${item.icon} text-xs`}></i>
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-slate-200">
             <div className="text-right">
                <p className="text-xs font-black text-slate-900 leading-none mb-1">{user.name}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.role}</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                {user.name.charAt(0)}
             </div>
          </div>
          
          <button onClick={onLogout} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center">
            <i className="fas fa-power-off"></i>
          </button>
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl animate-fadeIn p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-4 p-4 rounded-2xl text-base font-black ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-600'}`}>
              <i className={`fas ${item.icon} w-6 text-center`}></i>
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
