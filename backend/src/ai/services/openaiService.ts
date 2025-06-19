import OpenAI from 'openai';

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async analyzeResponse(text: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一个面试教练，负责分析面试者的回答并提供专业的反馈和建议。'
          },
          {
            role: 'user',
            content: `请分析这段面试回答并提供改进建议：${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI API 错误:', error);
      throw error;
    }
  }
}