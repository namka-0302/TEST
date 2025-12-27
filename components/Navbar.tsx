
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const isAdmin = user.role === 'Admin';

  const navItems = isAdmin ? [
    { name: 'Dashboard', path: '/', icon: 'fa-chart-line' },
    { name: 'Upload PDF', path: '/upload', icon: 'fa-file-pdf' },
    { name: 'Manual Add', path: '/manual-add', icon: 'fa-plus-circle' },
    { name: 'Bank', path: '/bank', icon: 'fa-database' },
    { name: 'Create Quiz', path: '/create-quiz', icon: 'fa-clipboard-check' },
  ] : [
    { name: 'Dashboard', path: '/', icon: 'fa-chart-line' },
    { name: 'Learn', path: '/learn', icon: 'fa-book-open' },
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <i className="fas fa-graduation-cap text-white text-xl"></i>
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-800">QuizMaster</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                location.pathname === item.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              <i className={`fas ${item.icon}`}></i>
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-gray-900">{user.name}</span>
            <span className={`text-[10px] uppercase font-black px-1.5 rounded ${isAdmin ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {user.role}
            </span>
          </div>
          <button 
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
