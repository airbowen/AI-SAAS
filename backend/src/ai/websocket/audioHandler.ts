import WebSocket from 'ws';
import { SpeechService } from '../services/speechService';
import { OpenAIService } from '../services/openaiService';

export class AudioHandler {
  private speechService: SpeechService;
  private openaiService: OpenAIService;

  constructor() {
    this.speechService = new SpeechService(
      process.env.TENCENT_CLOUD_SECRET_ID || '',
      process.env.TENCENT_CLOUD_SECRET_KEY || ''
    );
    this.openaiService = new OpenAIService(
      process.env.OPENAI_API_KEY || ''
    );
  }

  async handleAudioData(ws: WebSocket, data: Buffer) {
    try {
      // 转换音频为文字
      const text = await this.speechService.transcribe(data);

      // 发送转录文本给客户端
      ws.send(JSON.stringify({
        type: 'transcription',
        text
      }));

      // 使用 OpenAI 分析回答
      const analysis = await this.openaiService.analyzeResponse(text);

      // 发送分析结果给客户端
      ws.send(JSON.stringify({
        type: 'analysis',
        text: analysis
      }));
    } catch (error) {
      console.error('处理音频数据错误:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: '处理音频数据时出错'
      }));
    }
  }
}