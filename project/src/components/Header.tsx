import React from 'react';
import { Menu, X, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';
import UserMenu from './auth/UserMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const { user, loading } = useAuth();

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">面试助手</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">核心功能</a>
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">服务项目</a>
              <a href="#success" className="text-gray-600 hover:text-blue-600 transition-colors">成功案例</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">价格方案</a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <UserMenu />
              ) : (
                <>
                  <button 
                    onClick={() => handleAuthClick('login')}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    登录
                  </button>
                  <button 
                    onClick={() => handleAuthClick('register')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    免费试用
                  </button>
                </>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                <a href="#features" className="block px-3 py-2 text-gray-600 hover:text-blue-600">核心功能</a>
                <a href="#services" className="block px-3 py-2 text-gray-600 hover:text-blue-600">服务项目</a>
                <a href="#success" className="block px-3 py-2 text-gray-600 hover:text-blue-600">成功案例</a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-blue-600">价格方案</a>
                <div className="px-3 py-2 space-y-2">
                  {user ? (
                    <UserMenu />
                  ) : (
                    <>
                      <button 
                        onClick={() => handleAuthClick('login')}
                        className="w-full text-left text-gray-600 hover:text-blue-600"
                      >
                        登录
                      </button>
                      <button 
                        onClick={() => handleAuthClick('register')}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        免费试用
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;