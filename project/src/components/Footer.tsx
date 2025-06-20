import React from 'react';
import { Target, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Target className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">面试助手</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              通过全面的面试准备和辅导，助力专业人士在职业道路上取得成功。
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-3" />
                contact@mianshizhushou.com
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-3" />
                400-123-4567
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-3" />
                北京市朝阳区
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">服务项目</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">AI模拟面试</a></li>
              <li><a href="#" className="hover:text-white transition-colors">简历审查</a></li>
              <li><a href="#" className="hover:text-white transition-colors">辅导课程</a></li>
              <li><a href="#" className="hover:text-white transition-colors">职业指导</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">公司信息</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
              <li><a href="#" className="hover:text-white transition-colors">博客</a></li>
              <li><a href="#" className="hover:text-white transition-colors">招聘</a></li>
              <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 面试助手. 保留所有权利。
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">隐私政策</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">服务条款</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie政策</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;