import tencentcloud from 'tencentcloud-sdk-nodejs';

const AsrClient = tencentcloud.asr.v20190614.Client;

export class SpeechService {
  private client: any;

  constructor(secretId: string, secretKey: string) {
    const clientConfig = {
      credential: {
        secretId,
        secretKey,
      },
      region: 'ap-guangzhou',
      profile: {
        httpProfile: {
          endpoint: 'asr.tencentcloudapi.com',
        },
      },
    };
    this.client = new AsrClient(clientConfig);
  }

  async transcribe(audioData: Buffer): Promise<string> {
    try {
      const base64Audio = audioData.toString('base64');
      const params = {
        EngineModelType: '16k_zh',
        ChannelNum: 1,
        ResTextFormat: 0,
        SourceType: 1,
        Data: base64Audio,
      };

      const result = await this.client.SentenceRecognition(params);
      return result.Result;
    } catch (error) {
      console.error('语音识别错误:', error);
      throw error;
    }
  }
}