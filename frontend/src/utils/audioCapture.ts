interface CaptureOptions {
  onError?: (error: Error) => void;
  onSuccess?: (stream: MediaStream) => void;
}

export async function captureTabAudio(options: CaptureOptions = {}) {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "browser" // 指定只捕获浏览器标签页
      },
      audio: true // 使用简单的音频配置
    });

    // 检查是否有音频轨道
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      throw new Error('没有检测到音频轨道');
    }

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
  stream.getTracks().forEach(track => track.stop());
}