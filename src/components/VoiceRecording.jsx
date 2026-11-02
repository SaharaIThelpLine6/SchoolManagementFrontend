import { useCallback, useEffect, useRef, useState } from 'react';
import Button from './Button/Button';
import { useUploadVoiceRecordingMutation } from '../features/sms/smsSlice';

const supportedTypes = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
};
const maxAudioSize = 10 * 1024 * 1024;
const formatElapsed = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};

const VoiceRecording = () => {
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const previewUrlRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const timerRef = useRef(null);
  const [audioFile, setAudioFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadVoiceRecording, { isLoading: isUploading }] = useUploadVoiceRecordingMutation();

  const stopVisuals = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
    const audioContext = audioContextRef.current;
    audioContextRef.current = null;
    if (audioContext) void audioContext.close().catch(() => {});
  }, []);

  useEffect(() => {
    if (!isRecording || !streamRef.current) return undefined;

    const startedAt = performance.now();
    timerRef.current = setInterval(() => setElapsedMs(performance.now() - startedAt), 100);
    const canvas = canvasRef.current;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (canvas && AudioContextClass) {
      try {
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;
        void audioContext.resume().catch(() => {});
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        audioContext.createMediaStreamSource(streamRef.current).connect(analyser);

        const pixelRatio = window.devicePixelRatio || 1;
        const width = canvas.clientWidth || 240;
        const height = 40;
        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        const context = canvas.getContext('2d');
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        const samples = new Uint8Array(analyser.fftSize);
        const barWidth = 2;
        const gap = 2;
        const barCount = Math.min(56, Math.max(1, Math.floor((width + gap) / (barWidth + gap))));
        const levels = new Float32Array(barCount).fill(3);
        const waveformWidth = barCount * barWidth + (barCount - 1) * gap;
        const left = (width - waveformWidth) / 2;

        const draw = () => {
          analyser.getByteTimeDomainData(samples);
          context.clearRect(0, 0, width, height);
          context.fillStyle = '#2563eb';
          for (let i = 0; i < barCount; i++) {
            const start = Math.floor(i * samples.length / barCount);
            const end = Math.floor((i + 1) * samples.length / barCount);
            let energy = 0;
            for (let j = start; j < end; j++) {
              const value = (samples[j] - 128) / 128;
              energy += value * value;
            }
            const target = Math.min(height - 4, Math.max(3, Math.sqrt(energy / (end - start)) * 180));
            levels[i] += (target - levels[i]) * 0.35;
            context.fillRect(left + i * (barWidth + gap), (height - levels[i]) / 2, barWidth, levels[i]);
          }
          animationFrameRef.current = requestAnimationFrame(draw);
        };
        draw();
      } catch {
        // Recording and the timer still work if audio visualisation is unavailable.
      }
    }

    return stopVisuals;
  }, [isRecording, stopVisuals]);

  useEffect(() => () => {
    if (recorderRef.current) {
      recorderRef.current.onstop = null;
      recorderRef.current.ondataavailable = null;
      if (recorderRef.current.state === 'recording') recorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    stopVisuals();
  }, [stopVisuals]);

  const selectAudio = (file) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setPreviewUrl(url);
    setAudioFile(file);
    setSavedUrl('');
    setCopied(false);
    setError('');
  };

  const startRecording = async () => {
    setError('');
    setElapsedMs(0);
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('This browser cannot record audio. Choose an audio file instead.');
      return;
    }

    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
      .find((type) => MediaRecorder.isTypeSupported(type));
    if (!mimeType) {
      setError('Audio recording is not supported in this browser. Choose an audio file instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => {
        recorder.onstop = null;
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
        setError('Recording failed. Please try again.');
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setIsRecording(false);
        const type = recorder.mimeType.split(';')[0];
        const file = new File([new Blob(chunks, { type })], `voice-recording.${supportedTypes[type]}`, { type });
        if (!file.size) {
          setError('No audio was recorded. Please try again.');
          return;
        }
        if (file.size > maxAudioSize) {
          setError('The recording is too large. Record a shorter message (maximum 10 MB).');
          return;
        }
        selectAudio(file);
      };

      recorder.start();
      setIsRecording(true);
    } catch (recordError) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError(recordError?.name === 'NotAllowedError'
        ? 'Microphone access was denied. Allow access or choose an audio file.'
        : 'Could not start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const chooseFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    const type = file.type.split(';')[0].toLowerCase();
    if (!supportedTypes[type]) {
      setError('Choose a WebM, Ogg, M4A, MP3, or WAV audio file.');
      return;
    }
    if (!file.size || file.size > maxAudioSize) {
      setError('Choose an audio file smaller than 10 MB.');
      return;
    }
    setElapsedMs(0);
    selectAudio(file);
  };

  const saveRecording = async () => {
    if (!audioFile) {
      setError('Record or choose an audio file first.');
      return;
    }
    setError('');
    try {
      const response = await uploadVoiceRecording(audioFile).unwrap();
      setSavedUrl(response.url);
    } catch (uploadError) {
      setError(uploadError?.data?.error || 'Could not save the recording. Please try again.');
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(savedUrl);
      setCopied(true);
    } catch {
      setError('Could not copy the URL. Select and copy it from the field.');
    }
  };

  return (
    <div className="font-default bg-white md:p-4 rounded-xl shadow-lg">
      <h2 className="text-lg md:text-xl font-bold text-gray-800">Voice recording</h2>
      <p className="mt-1 text-sm text-gray-600">
        Record your message or choose an audio file, then save it to get a public URL.
      </p>

      <div className="mt-5 max-w-2xl space-y-4 rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {!isRecording ? (
            <Button type="button" onClick={startRecording} disabled={isUploading}>
              Start recording
            </Button>
          ) : (
            <Button type="button" onClick={stopRecording} className="bg-red-500 hover:bg-red-600">
              Stop recording
            </Button>
          )}
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Choose audio file
            <input
              type="file"
              accept="audio/webm,audio/ogg,audio/mp4,audio/x-m4a,audio/mpeg,audio/wav,audio/x-wav"
              className="sr-only"
              onChange={chooseFile}
              disabled={isRecording || isUploading}
            />
          </label>
        </div>

        {isRecording && (
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
              <span>Recording</span>
              <time className="ml-auto font-mono tabular-nums">{formatElapsed(elapsedMs)}</time>
            </div>
            <canvas ref={canvasRef} className="mt-2 h-10 w-full max-w-[240px]" aria-label="Live microphone audio levels" role="img" />
          </div>
        )}

        {previewUrl && (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Preview ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
              {elapsedMs > 0 && ` · ${formatElapsed(elapsedMs)}`}
            </p>
            <audio controls src={previewUrl} className="w-full" />
          </div>
        )}

        <Button type="button" onClick={saveRecording} disabled={!audioFile || isRecording || isUploading} loading={isUploading}>
          Save recording and get URL
        </Button>

        {savedUrl && (
          <div className="space-y-2" role="status">
            <label htmlFor="voice-url" className="block text-sm font-medium text-gray-700">Saved audio URL</label>
            <input id="voice-url" readOnly value={savedUrl} onFocus={(event) => event.target.select()} className="w-full rounded border border-gray-300 p-2 text-sm" />
            <div className="flex gap-3 text-sm">
              <Button type="button" onClick={copyUrl}>{copied ? 'Copied' : 'Copy URL'}</Button>
              <a href={savedUrl} target="_blank" rel="noopener noreferrer" className="self-center text-blue-600 underline">Open recording</a>
            </div>
          </div>
        )}

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default VoiceRecording;
