import React from 'react';
import { Check, Star } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "基础版",
      price: "¥199",
      period: "/月",
      description: "适合面试准备入门用户",
      features: [
        "每月5次AI模拟面试",
        "基础表现分析",
        "简历审查",
        "邮件支持",
        "移动应用访问"
      ],
      popular: false
    },
    {
      name: "专业版",
      price: "¥499",
      period: "/月",
      description: "为认真求职者提供全面准备",
      features: [
        "无限次AI模拟面试",
        "高级分析和洞察",
        "专家辅导课程（2小时）",
        "优先支持",
        "行业专属题库",
        "面试安排助手",
        "定制反馈报告"
      ],
      popular: true
    },
    {
      name: "高管版",
      price: "¥1299",
      period: "/月",
      description: "为高级领导职位量身打造的高端套餐",
      features: [
        "包含专业版所有功能",
        "每周一对一辅导课程",
        "个人品牌建设",
        "高管形象指导",
        "薪资谈判支持",
        "LinkedIn档案优化",
        "24/7专属支持"
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            选择你的成功方案
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            灵活的价格选择，满足你的职业目标和预算需求
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-2xl p-8 relative ${
                plan.popular ? 'ring-2 ring-blue-600 shadow-xl scale-105' : 'shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    最受欢迎
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                开始免费试用
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600">
            所有方案均包含14天免费试用，无需信用卡。
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;