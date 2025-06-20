import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "陈小雅",
      role: "谷歌软件工程师",
      image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "面试助手的AI模拟面试非常真实。反馈帮助我发现了自己的薄弱环节，最终成功拿到了谷歌的offer。",
      rating: 5
    },
    {
      name: "王志强",
      role: "Meta产品经理",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "行为面试辅导彻底改变了我讲述职业故事的方式。仅仅两周时间，我就从紧张变得自信满满。",
      rating: 5
    },
    {
      name: "李美华",
      role: "Netflix数据科学家",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      content: "技术面试准备内容全面且与时俱进。面对他们抛出的每一个编程挑战，我都感到充分准备。",
      rating: 5
    }
  ];

  return (
    <section id="success" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            成功案例
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            加入数千名在我们帮助下获得理想工作的专业人士行列
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-2xl relative">
              <Quote className="h-8 w-8 text-blue-600 mb-6" />
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;