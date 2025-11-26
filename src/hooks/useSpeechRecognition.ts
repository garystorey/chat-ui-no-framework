import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useUnmount from './useUnmount';

interface UseSpeechRecognitionOptions {
  locale?: string;
  autoStop?: boolean;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognitionWithVendor = SpeechRecognitionConstructor & {
  new (): SpeechRecognition;
};

const getSpeechRecognitionConstructor = (): SpeechRecognitionWithVendor | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const speechRecognition = (window as Window & {
    webkitSpeechRecognition?: SpeechRecognitionWithVendor;
  }).SpeechRecognition;

  const webkitSpeechRecognition = (window as Window & {
    webkitSpeechRecognition?: SpeechRecognitionWithVendor;
  }).webkitSpeechRecognition;

  return speechRecognition || webkitSpeechRecognition || null;
};

const useSpeechRecognition = ({
  locale,
  autoStop = true,
}: UseSpeechRecognitionOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');

  const SpeechRecognitionConstructor = useMemo(
    () => getSpeechRecognitionConstructor(),
    [],
  );

  const supported = Boolean(SpeechRecognitionConstructor);

  const resetState = useCallback(() => {
    setIsRecording(false);
    setTranscript(finalTranscriptRef.current.trim());
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const handleResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';

        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${text}`.trim();
        } else {
          interimTranscript += text;
        }
      }

      const combinedTranscript = `${finalTranscriptRef.current} ${interimTranscript}`.trim();
      setTranscript(combinedTranscript);
    },
    [],
  );

  const handleError = useCallback((event: SpeechRecognitionErrorEvent) => {
    setError(event.error);
    resetState();
    recognitionRef.current = null;
  }, [resetState]);

  const handleEnd = useCallback(() => {
    resetState();
    recognitionRef.current = null;
  }, [resetState]);

  const start = useCallback(async () => {
    if (!supported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is not available in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch (permissionError) {
      setError('Microphone permission was denied.');
      return;
    }

    setError(null);
    finalTranscriptRef.current = '';
    setTranscript('');

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = locale ?? recognition.lang;
    recognition.interimResults = true;
    recognition.continuous = !autoStop;
    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    recognitionRef.current = recognition;
    setIsRecording(true);
    recognition.start();
  }, [SpeechRecognitionConstructor, autoStop, handleEnd, handleError, handleResult, locale, supported]);

  useEffect(() => {
    if (!supported) {
      setError('Speech recognition is not supported in this browser.');
    }
  }, [supported]);

  useUnmount(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  });

  return {
    supported,
    start,
    stop,
    isRecording,
    transcript,
    error,
  };
};

export default useSpeechRecognition;
