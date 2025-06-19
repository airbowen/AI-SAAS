import { WebSocketClient } from './websocketClient';

interface CaptureOptions {
  onError?: (error: Error) => void;
  onSuccess?: (stream: MediaStream) => void;
  onTranscription?: (text: string) => void;
  tencentCloudSecretId?: string;
  tencentCloudSecretKey?: string;
}

export async function captureTabAudio(options: CaptureOptions = {}) {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "browser" as DisplayCaptureSurfaceType
      },
      audio: true
    } as DisplayMediaStreamOptions);

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new Error('没有检测到音频轨道');
    }

    const mediaRecorder = new MediaRecorder(stream);
    const wsClient = new WebSocketClient('ws://your-backend-url/ws', {
      tencentCloudSecretId: options.tencentCloudSecretId,
      tencentCloudSecretKey: options.tencentCloudSecretKey,
      onMessage: (event: MessageEvent<any>) => {
        const response = JSON.parse(event.data);
        if (response.type === 'transcription') {
          options.onTranscription?.(response.text);
        }
      },
      onError: (error: Error) => {
        console.error('WebSocket 错误:', error);
        options.onError?.(error);
      }
    });

    wsClient.connect();
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        try {
          wsClient.send(event.data);
        } catch (error) {
          console.error('发送音频数据错误:', error);
        }
      }
    };

    mediaRecorder.start(1000); // 每秒发送一次数据
    options.onSuccess?.(stream);

    return {
      stream,
      stop: () => {
        mediaRecorder.stop();
        wsClient.close();
        stream.getTracks().forEach(track => track.stop());
      }
    };
  } catch (error) {
    const err = error as Error;
    console.error('音频捕获错误:', {
      名称: err.name,
      信息: err.message,
      堆栈: err.stack
    });
    options.onError?.(err);
    throw err;
  }
}