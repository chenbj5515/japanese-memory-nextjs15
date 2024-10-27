import { useRef, useEffect, useState, useCallback } from 'react';

export function useTripleRightClick(callback: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  const clickCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetClickCount = useCallback(() => {
    clickCountRef.current = 0;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (event.button === 2) { // 2 是鼠标右键
        clickCountRef.current += 1;

        if (clickCountRef.current === 3) {
          callback();
          resetClickCount();
        } else {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
          timerRef.current = setTimeout(resetClickCount, 1000); // 1 秒内必须点击三次
        }
      }
    },
    [callback, resetClickCount]
  );

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.addEventListener('mousedown', handleClick);
    }

    return () => {
      if (element) {
        element.removeEventListener('mousedown', handleClick);
      }
    };
  }, [handleClick]);

  return ref;
}

export function useAudioRecorder() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioURL = useRef<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('ブラウザーは録音をサポートしていません。');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event: BlobEvent) => {
        audioChunks.current.push(event.data);
      };

      recorder.onstop = () => {
        if (audioURL.current) {
          window.URL.revokeObjectURL(audioURL.current);
        }
        const blob = new Blob(audioChunks.current, { type: 'audio/mp3' });
        audioURL.current = window.URL.createObjectURL(blob);
        audio.current = new Audio(audioURL.current!);
        audioChunks.current = [];
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (err) {
      console.error('マイクにアクセスできません', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const playRecording = () => {
    if (audio.current) {
      audio.current.play();
    }
  };

  useEffect(() => {
    return () => {
      if (audioURL.current) {
        window.URL.revokeObjectURL(audioURL.current);
      }
    };
  }, []);

  return { startRecording, stopRecording, playRecording };
}