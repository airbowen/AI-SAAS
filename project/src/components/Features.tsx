import React from 'react';
import { Bot, FileText, Users, BarChart3, Clock, Shield } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Bot,
      title: "AI 模拟面试",
      description: "与我们先进的AI面试官练习，它能根据你的回答进行调整并提供实时反馈。",
      color: "text-blue-600"
    },
    {
      icon: FileText,
      title: "简历优化",
      description: "获得详细的分析和建议，让你的简历在招聘经理面前脱颖而出。",
      color: "text-cyan-600"
    },
    {
      icon: Users,
      title: "专家指导",
      description: "与行业专业人士联系，获得个性化的一对一面试辅导课程。",
      color: "text-orange-600"
    },
    {
      icon: BarChart3,
      title: "表现分析",
      description: "通过详细的分析报告跟踪你的进步，识别需要改进的领域。",
      color: "text-green-600"
    },
    {
      icon: Clock,
      title: "灵活安排",
      description: "通过我们全天候可用的平台和移动应用，随时随地进行练习。",
      color: "text-purple-600"
    },
    {
      icon: Shield,
      title: "安全私密",
      description: "你的练习记录和个人数据都经过加密处理，完全保密。",
      color: "text-red-600"
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            成功所需的一切工具
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            全面的工具和资源，旨在帮助你在任何面试场景中表现出色
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all hover:shadow-lg group"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gray-50 ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;