
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
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
          <div className="bg-indigo-600 p-2 rounded-xl">
            <i className="fas fa-graduation-cap text-white text-lg"></i>
          </div>
          <span className="font-black text-lg tracking-tight text-gray-900">QuizMaster</span>
        </Link>
        
        {/* Desktop Navigation */}
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
            className="hidden sm:flex w-10 h-10 rounded-xl bg-gray-50 items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-600 bg-gray-50 rounded-xl"
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b shadow-xl animate-slideDown overflow-hidden transition-all">
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`flex items-center gap-4 p-4 rounded-2xl text-base font-bold ${
                  location.pathname === item.path ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-600 bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${location.pathname === item.path ? 'bg-white/20' : 'bg-white'}`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                {item.name}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-100">
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-base font-bold text-red-600 bg-red-50"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-red-600">
                  <i className="fas fa-sign-out-alt"></i>
                </div>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
