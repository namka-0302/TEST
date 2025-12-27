
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { db } from '../services/dbService';

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
    { name: 'Tổng quan', path: '/', icon: 'fa-chart-line' },
    { name: 'Ngân hàng', path: '/bank', icon: 'fa-database' },
    { name: 'Bài thi', path: '/quizzes', icon: 'fa-clipboard-check' },
    { name: 'Học viên', path: '/students', icon: 'fa-users' },
    { name: 'Nhật ký', path: '/history', icon: 'fa-history' },
  ] : [
    { name: 'Tổng quan', path: '/', icon: 'fa-chart-line' },
    { name: 'Học tập', path: '/learn', icon: 'fa-book-open' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-[100] shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
            <i className="fas fa-graduation-cap text-white text-lg"></i>
          </div>
          <span className="font-black text-lg tracking-tight text-gray-900">QuizMaster</span>
          
          <div className={`ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-tighter transition-all ${
            isCloud ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <span className={`relative flex h-2 w-2 ${isCloud ? 'flex' : 'hidden'}`}>
              <span className={`absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${isSyncing ? 'animate-ping' : ''}`}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <i className={`fas ${isSyncing ? 'fa-sync-alt fa-spin' : isCloud ? 'fa-cloud' : 'fa-house-user'}`}></i>
            <span className="hidden sm:inline">{isSyncing ? 'Đang đồng bộ...' : isCloud ? 'Cloud Sync' : 'Offline'}</span>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                location.pathname === item.path || (item.path === '/quizzes' && location.pathname.includes('/edit-quiz')) || (item.path === '/bank' && location.pathname.includes('/edit-question'))
                ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <i className={`fas ${item.icon}`}></i>
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs font-black text-gray-900">{user.name}</span>
            <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${isAdmin ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {user.role}
            </span>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 bg-gray-50 rounded-xl">
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b shadow-xl animate-slideDown overflow-hidden transition-all">
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={closeMenu} className={`flex items-center gap-4 p-4 rounded-2xl text-base font-bold ${location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 bg-gray-50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${location.pathname === item.path ? 'bg-white/20' : 'bg-white'}`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
