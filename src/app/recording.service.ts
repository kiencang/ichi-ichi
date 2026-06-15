import { Injectable, signal, inject } from '@angular/core';
import { DeviceDetector } from './device-detector';
import { CanvasMixer } from './canvas-mixer';
import { ToastService } from './toast.service';
import { MESSAGES, APP_CONFIG } from './constants';

export interface RecordConfig {
  isCameraEnabled: boolean;
  cameraStream: MediaStream | null;
  cameraPos: { x: number, y: number };
  cameraSize: number;
  qualityPreset: 'high' | 'medium' | 'low';
  cachedWindowWidth: number;
  cachedWindowHeight: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private deviceDetector = inject(DeviceDetector);
  private toastService = inject(ToastService);

  isRecording = signal(false);
  isCountingDown = signal(false);
  countdownValue = signal<number | string>(5);
  recordingTime = signal(0);
  errorMessage = signal('');
  audioLevels = signal<number[]>([15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
  recordingAttempted = signal(false);

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private countdownTimerInterval: ReturnType<typeof setInterval> | null = null;
  
  private timerWorker: Worker | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private combinedStream: MediaStream | null = null;
  private displayStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  
  private displayVideoEle: HTMLVideoElement | null = null;
  private canvasEle: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;

  async startRecording(config: RecordConfig) {
    this.errorMessage.set('');
    this.recordingAttempted.set(true);
    try {
      const idealFps = 60;
      try {
        this.displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            displaySurface: 'monitor',
            frameRate: { ideal: idealFps, max: idealFps }
          } as MediaTrackConstraints, 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
            channelCount: 2
          } as unknown as MediaTrackConstraints
        });
      } catch {
        this.displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            displaySurface: 'monitor',
            frameRate: { ideal: idealFps, max: idealFps }
          } as MediaTrackConstraints, 
          audio: true
        });
      }

      // 2. Mic
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000
          }
        });
        this.deviceDetector.micPermission.set('granted');
        this.deviceDetector.checkMicStatus();
      } catch (err) {
        const errorName = (err instanceof Error) ? err.name : '';
        if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
            this.deviceDetector.micPermission.set('denied');
        }
        this.deviceDetector.checkMicStatus();
        this.errorMessage.set(MESSAGES.ERRORS.MIC_NOT_FOUND);
        setTimeout(() => this.errorMessage.set(''), 5000);
      }

      // Mix Audio
      this.audioCtx = new AudioContext({ sampleRate: 48000 });
      const dest = this.audioCtx.createMediaStreamDestination();
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 32;

      let hasAudio = false;

      if (this.displayStream.getAudioTracks().length > 0) {
        const displayAudioSource = this.audioCtx.createMediaStreamSource(new MediaStream([this.displayStream.getAudioTracks()[0]]));
        displayAudioSource.connect(dest);
        displayAudioSource.connect(this.analyserNode);
        hasAudio = true;
      }

      if (this.micStream && this.micStream.getAudioTracks().length > 0) {
        const micAudioSource = this.audioCtx.createMediaStreamSource(this.micStream);
        micAudioSource.connect(dest);
        micAudioSource.connect(this.analyserNode);
        hasAudio = true;
      }

      let videoTracks = this.displayStream.getVideoTracks();
      
      if (config.isCameraEnabled && config.cameraStream) {
          this.displayVideoEle = document.createElement('video');
          this.displayVideoEle.muted = true;
          this.displayVideoEle.autoplay = true;
          this.displayVideoEle.playsInline = true;
          
          this.displayVideoEle.srcObject = this.displayStream;
          
          await new Promise<void>((resolve) => {
              this.displayVideoEle!.onloadedmetadata = () => {
                  this.displayVideoEle!.play();
                  this.canvasEle = document.createElement('canvas');
                  
                  let targetWidth = this.displayVideoEle!.videoWidth;
                  let targetHeight = this.displayVideoEle!.videoHeight;
                  const MAX_RESOLUTION = APP_CONFIG.CONSTRAINTS.MAX_RESOLUTION;
                  if (targetWidth > MAX_RESOLUTION) {
                      const scaleFactor = MAX_RESOLUTION / targetWidth;
                      targetWidth = MAX_RESOLUTION;
                      targetHeight = Math.round(targetHeight * scaleFactor);
                  }
                  
                  this.canvasEle.width = targetWidth;
                  this.canvasEle.height = targetHeight;
                  
                  this.canvasCtx = this.canvasEle!.getContext('2d', { alpha: false });
                  if (this.canvasCtx) {
                      this.canvasCtx.imageSmoothingEnabled = true;
                      this.canvasCtx.imageSmoothingQuality = 'medium';
                  }
                  resolve();
              };
          });

          let isDrawingFrame = false;
          const drawFrame = () => {
              if (isDrawingFrame) return;
              if (!this.canvasCtx || !this.displayVideoEle || !this.canvasEle) return;
              
              isDrawingFrame = true;
              const camVideoEl = document.getElementById('camPreview') as HTMLVideoElement;
              CanvasMixer.drawFrame(this.canvasCtx, this.canvasEle, this.displayVideoEle, camVideoEl, {
                  isCameraEnabled: config.isCameraEnabled,
                  cameraPos: config.cameraPos,
                  cameraSize: config.cameraSize,
                  windowWidth: config.cachedWindowWidth,
                  windowHeight: config.cachedWindowHeight
              });
              isDrawingFrame = false;
          };

          try {
              const workerCode = `
                  let timerId = null;
                  self.onmessage = function(e) {
                      if (e.data.action === 'start') {
                          const interval = e.data.interval || 33.33;
                          if (timerId) clearInterval(timerId);
                          timerId = setInterval(() => {
                              self.postMessage('tick');
                           }, interval);
                      } else if (e.data.action === 'stop') {
                          if (timerId) clearInterval(timerId);
                          timerId = null;
                      }
                  };
              `;
              const blob = new Blob([workerCode], { type: 'application/javascript' });
              this.timerWorker = new Worker(URL.createObjectURL(blob));
              this.timerWorker.onmessage = () => {
                  drawFrame();
              };
              this.timerWorker.postMessage({ action: 'start', interval: 1000 / idealFps });
          } catch (err) {
              console.error('Không thể khởi tạo timer worker:', err);
              this.timerWorker = null;
              const intervalId = window.setInterval(drawFrame, 1000 / idealFps);
              this.timerWorker = {
                  postMessage() {},
                  terminate() { window.clearInterval(intervalId); },
                  onmessage: null
              } as unknown as Worker;
          }

          videoTracks = this.canvasEle!.captureStream(idealFps).getVideoTracks();
      }

      const tracks: MediaStreamTrack[] = [...videoTracks];
      
      if (hasAudio) {
          tracks.push(...dest.stream.getAudioTracks());
      }

      this.combinedStream = new MediaStream(tracks);

      this.displayStream.getVideoTracks()[0].onended = () => {
          if (this.isRecording()) {
              this.stopRecording();
          }
      };

      this.recordedChunks = [];
      const types = [
        'video/webm; codecs=vp9,opus',
        'video/webm; codecs=vp8,opus',
        'video/webm'
      ];
      
      let videoBitsPerSecond = 8000000;
      let audioBitsPerSecond = 320000;
      
      const preset = config.qualityPreset;
      if (preset === 'medium') {
          videoBitsPerSecond = 4000000;
          audioBitsPerSecond = 192000;
      } else if (preset === 'low') {
          videoBitsPerSecond = 2000000;
          audioBitsPerSecond = 128000;
      }

      const mimeType = types.find(type => MediaRecorder.isTypeSupported(type)) || '';
      const options = mimeType ? { mimeType, videoBitsPerSecond, audioBitsPerSecond } : { videoBitsPerSecond, audioBitsPerSecond };
      
      this.mediaRecorder = new MediaRecorder(this.combinedStream, options);

      this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
              this.recordedChunks.push(e.data);
          }
      };

      this.mediaRecorder.onstop = () => {
          this.saveRecording();
          this.cleanupStreams();
      };

      this.isCountingDown.set(true);
      this.countdownValue.set(5);

      this.countdownTimerInterval = setInterval(() => {
          const current = this.countdownValue();
          if (typeof current === 'number' && current > 1) {
              this.countdownValue.set(current - 1);
          } else {
              if (this.countdownTimerInterval !== null) {
                  clearInterval(this.countdownTimerInterval);
                  this.countdownTimerInterval = null;
              }
              this.countdownValue.set('ACTION!');
              
              const startRecordingAction = () => {
                  this.mediaRecorder!.start(1000); 
  
                  this.isRecording.set(true);
                  this.isCountingDown.set(false);
                  this.recordingTime.set(0);
                  this.timerInterval = setInterval(() => {
                      this.recordingTime.update(t => t + 1);
                  }, 1000);
  
                  if (hasAudio && this.analyserNode) {
                      this.updateAudioLevels();
                  }
              };

              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance('Action');
                  utterance.lang = 'en-US';
                  utterance.rate = 1.2;
                  
                  utterance.onend = startRecordingAction;
                  utterance.onerror = startRecordingAction;
                  
                  window.speechSynthesis.speak(utterance);
              } else {
                  startRecordingAction();
              }
          }
      }, 1000);

    } catch (err) {
      const errorName = (err instanceof Error) ? err.name : '';
      if (errorName === 'NotAllowedError') {
        this.errorMessage.set(MESSAGES.ERRORS.SCREEN_SHARE_DENIED);
      } else {
        this.errorMessage.set(MESSAGES.ERRORS.GENERAL_RECORD_ERROR);
      }
      setTimeout(() => this.errorMessage.set(''), 8000);
      this.cleanupStreams();
    }
  }

  updateAudioLevels = () => {
      if (!this.isRecording() || !this.analyserNode) {
          this.audioLevels.set([15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
          return;
      }
      const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.analyserNode.getByteFrequencyData(dataArray);
      
      const levels = [
          Math.max(15, (dataArray[0] / 255) * 100),
          Math.max(15, (dataArray[1] / 255) * 100),
          Math.max(15, (dataArray[2] / 255) * 100),
          Math.max(15, (dataArray[3] / 255) * 100),
          Math.max(15, (dataArray[4] / 255) * 100),
          Math.max(15, (dataArray[5] / 255) * 100),
          Math.max(15, (dataArray[6] / 255) * 100),
          Math.max(15, (dataArray[7] / 255) * 100),
          Math.max(15, (dataArray[8] / 255) * 100),
          Math.max(15, (dataArray[9] / 255) * 100)
      ];
      this.audioLevels.set(levels);
      this.animationFrameId = requestAnimationFrame(this.updateAudioLevels);
  }

  stopRecording() {
      if (this.isCountingDown()) {
          if (this.countdownTimerInterval !== null) {
              clearInterval(this.countdownTimerInterval);
              this.countdownTimerInterval = null;
          }
          this.isCountingDown.set(false);
          this.cleanupStreams();
          return;
      }

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
      } else {
          this.cleanupStreams();
      }
      this.isRecording.set(false);
      if (this.timerInterval !== null) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
      }
  }

  private saveRecording() {
      if (this.recordedChunks.length === 0) return;
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a); 
      a.style.display = 'none';
      a.href = url;
      
      const now = new Date();
      const dd = now.getDate().toString().padStart(2, '0');
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      const yy = now.getFullYear().toString().slice(-2);
      const hh = now.getHours().toString().padStart(2, '0');
      const min = now.getMinutes().toString().padStart(2, '0');
      const ss = now.getSeconds().toString().padStart(2, '0');
      const fn = `[Ichi_Ichi_SR]_[${dd}_${mm}_${yy}]_[${hh}_${min}_${ss}].webm`;
      
      a.download = fn;
      a.click();
      
      setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.toastService.success(MESSAGES.SUCCESS.VIDEO_SAVED);
      }, 100);
      this.recordedChunks = [];
  }

  cleanupStreams() {
      if (this.timerWorker !== null) {
          try {
              this.timerWorker.postMessage({ action: 'stop' });
              this.timerWorker.terminate();
          } catch {
              // Gracefully ignore worker termination errors
          }
          this.timerWorker = null;
      }
      if (this.displayVideoEle) {
          this.displayVideoEle.pause();
          this.displayVideoEle.srcObject = null;
          this.displayVideoEle = null;
      }
      this.canvasEle = null;
      this.canvasCtx = null;

      if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
      }
      this.audioLevels.set([15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);

      if (this.displayStream) {
          this.displayStream.getTracks().forEach(t => t.stop());
          this.displayStream = null;
      }
      if (this.micStream) {
          this.micStream.getTracks().forEach(t => t.stop());
          this.micStream = null;
      }
      if (this.audioCtx) {
          if (this.audioCtx.state !== 'closed') {
              this.audioCtx.close();
          }
          this.audioCtx = null;
      }
      this.combinedStream = null;
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
      }
      this.mediaRecorder = null;
  }
}
