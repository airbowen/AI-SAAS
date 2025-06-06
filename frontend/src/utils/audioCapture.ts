interface CaptureOptions {
  onError?: (error: Error) => void;
  onSuccess?: (stream: MediaStream) => void;
  onTranscription?: (text: string) => void; // 新增转录回调
}

let websocket: WebSocket | null = null;

export async function captureTabAudio(options: CaptureOptions = {}) {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "browser"
      },
      audio: true
    });

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new Error('没有检测到音频轨道');
    }

    // 创建 WebSocket 连接
    websocket = new WebSocket('YOUR_GPT4O_MINI_WEBSOCKET_ENDPOINT');
    
    // 创建 MediaRecorder 来处理音频数据
    const mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && websocket?.readyState === WebSocket.OPEN) {
        websocket.send(event.data);
      }
    };

    // 处理 WebSocket 消息
    websocket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.type === 'transcription') {
        options.onTranscription?.(response.text);
      }
    };

    // 设置错误处理
    websocket.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      options.onError?.(new Error('WebSocket 连接错误'));
    };

    // 开始录制
    mediaRecorder.start(1000); // 每秒发送一次数据

    options.onSuccess?.(stream);
    return stream;
  } catch (error) {
    const err = error as Error;
    console.error('音频捕获错误详情:', {
      名称: err.name,
      信息: err.message,
      堆栈: err.stack
    });
    options.onError?.(err);
    throw err;
  }
}

export function stopAudioCapture(stream: MediaStream) {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
  stream.getTracks().forEach(track => track.stop());
}