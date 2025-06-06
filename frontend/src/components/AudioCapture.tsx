import { useState, useCallback } from 'react';
import { captureTabAudio, stopAudioCapture } from '../utils/audioCapture';

export function AudioCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCapture = useCallback(async () => {
    try {
      setError(null);
      const audioStream = await captureTabAudio({
        onError: (err) => setError(err.message),
      });
      setStream(audioStream);
      setIsCapturing(true);
    } catch (err) {
      console.error('音频捕获失败:', err);
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (stream) {
      stopAudioCapture(stream);
      setStream(null);
      setIsCapturing(false);
    }
  }, [stream]);

  return (
    <div className="audio-capture">
      <h2>音频捕获</h2>
      {error && <div className="error">{error}</div>}
      <button
        onClick={isCapturing ? stopCapture : startCapture}
      >
        {isCapturing ? '停止捕获' : '开始捕获'}
      </button>
      {isCapturing && (
        <div className="status">
          正在捕获音频...
        </div>
      )}
    </div>
  );
}