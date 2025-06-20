import React from 'react';
import { ArrowRight, Play, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './auth/AuthModal';

const Hero = () => {
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      // 如果用户已登录，跳转到仪表板或其他页面
      console.log('用户已登录，跳转到仪表板');
    } else {
      // 如果用户未登录，打开注册模态框
      setAuthModalOpen(true);
    }
  };

  return (
    <>
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center bg-blue-100 rounded-full px-4 py-2">
                <Star className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800 font-medium">已帮助 50,000+ 求职者成功入职</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              掌握你的下一次
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block">
                求职面试
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              获得个性化面试辅导，通过AI模拟面试进行练习，
              访问来自顶级公司的数千道真实面试题目。
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button 
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center"
              >
                {user ? '进入仪表板' : '开始免费试用'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <Play className="h-5 w-5 mr-2" />
                观看演示
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                <div className="text-gray-600">成功率</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">面试题库</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">AI 支持</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="register"
      />
    </>
  );
};

export default Hero;