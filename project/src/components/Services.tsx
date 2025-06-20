import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

const Services = () => {
  const services = [
    {
      title: "技术面试",
      description: "专门针对软件工程、数据科学和技术岗位的面试准备",
      features: ["编程挑战", "系统设计", "算法练习", "技术深度讨论"],
      image: "https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&w=500"
    },
    {
      title: "行为面试",
      description: "掌握讲故事技巧，自信地展示你的软技能",
      features: ["STAR方法训练", "常见行为问题", "个人故事打造", "自信心建设"],
      image: "https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=500"
    },
    {
      title: "高管面试",
      description: "针对领导层和高级管理职位的高水平面试准备",
      features: ["战略思维", "领导力场景", "愿景表达", "利益相关者管理"],
      image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=500"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            量身定制的面试准备
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            针对不同面试类型和职业水平设计的专业辅导项目
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all">
              <div className="h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  了解更多
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;