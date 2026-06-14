import { ChangeDetectionStrategy, Component, computed, signal, OnDestroy, OnInit, inject } from '@angular/core';
import { SettingsModal } from './settings-modal';
import { GuideModal } from './guide-modal';
import { DeviceDetector } from './device-detector';
import { CanvasMixer } from './canvas-mixer';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [SettingsModal, GuideModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:keydown)': 'handleKeydown($event)',
    '(window:mousemove)': 'handleMouseMove($event)',
    '(window:mouseup)': 'handleMouseUp()',
    '(window:resize)': 'updateCachedWindowSize()'
  }
})
export class App implements OnDestroy, OnInit {
  private deviceDetector = inject(DeviceDetector);

  isCameraEnabled = signal(false);
  cameraStream = signal<MediaStream | null>(null);
  cameraPos = signal({ x: 20, y: 0 });
  isDraggingCam = false;
  dragStart = { x: 0, y: 0 };
  dragInitialPos = { x: 0, y: 0 };

  cachedWindowWidth = 1920;
  cachedWindowHeight = 1080;
  
  private displayVideoEle: HTMLVideoElement | null = null;
  private canvasEle: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private timerWorker: Worker | null = null;

  isRecording = signal(false);
  isCountingDown = signal(false);
  countdownValue = signal<number | string>(5);
  recordingTime = signal(0);
  errorMessage = signal('');
  showSuccessToast = signal(false);
  successMessage = signal('');
  showGuideModal = signal(false);
  audioLevels = signal<number[]>([15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
  timerInterval: ReturnType<typeof setInterval> | null = null;
  countdownTimerInterval: ReturnType<typeof setInterval> | null = null;
  
  qualityPreset = signal<'high' | 'medium' | 'low'>('medium');
  tempQualityPreset = signal<'high' | 'medium' | 'low'>('medium');
  cameraSize = signal<number>(120);
  tempCameraSize = signal<number>(120);
  uiMode = signal<'default' | 'enhanced'>('default');
  tempUiMode = signal<'default' | 'enhanced'>('default');
  showSettingsModal = signal(false);

  hasMicDevice = this.deviceDetector.hasMicDevice;
  micPermission = this.deviceDetector.micPermission;
  hasCameraDevice = this.deviceDetector.hasCameraDevice;
  cameraPermission = this.deviceDetector.cameraPermission;
  cameraError = signal<string | null>(null);
  recordingAttempted = signal(false);

  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private combinedStream: MediaStream | null = null;
  private displayStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private animationFrameId: number | null = null;

  updateCachedWindowSize() {
      if (typeof window !== 'undefined') {
          this.cachedWindowWidth = window.innerWidth;
          this.cachedWindowHeight = window.innerHeight;
      }
  }

  setQualityPreset(preset: 'high' | 'medium' | 'low') {
      this.tempQualityPreset.set(preset);
  }

  openSettingsModal() {
      this.tempQualityPreset.set(this.qualityPreset());
      this.tempCameraSize.set(this.cameraSize());
      this.tempUiMode.set(this.uiMode());
      this.showSettingsModal.set(true);
  }

  saveSettings() {
      this.qualityPreset.set(this.tempQualityPreset());
      this.cameraSize.set(this.tempCameraSize());
      this.uiMode.set(this.tempUiMode());
      this.showSettingsModal.set(false);
      this.successMessage.set('Đã lưu cài đặt thành công!');
      this.showSuccessToast.set(true);
      setTimeout(() => this.showSuccessToast.set(false), 5000);
  }

  resetToDefaultSettings() {
      this.qualityPreset.set('medium');
      this.cameraSize.set(120);
      this.uiMode.set('default');
      this.tempQualityPreset.set('medium');
      this.tempCameraSize.set(120);
      this.tempUiMode.set('default');
      this.showSettingsModal.set(false);
      this.successMessage.set('Các cài đặt đã được chuyển về mặc định');
      this.showSuccessToast.set(true);
      setTimeout(() => this.showSuccessToast.set(false), 5000);
  }

  updateCameraSize(event: Event) {
      const input = event.target as HTMLInputElement;
      this.tempCameraSize.set(Number(input.value));
  }

  async ngOnInit() {
      if (typeof window !== 'undefined') {
          this.updateCachedWindowSize();
          this.cameraPos.set({ x: 20, y: this.cachedWindowHeight - 200 }); // default pos
      }
      await this.deviceDetector.initPermissions();
  }

  formattedTime = computed(() => {
    const t = this.recordingTime();
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  ngOnDestroy() {
     this.cleanupStreams();
     if (this.countdownTimerInterval) clearInterval(this.countdownTimerInterval);
     if (this.timerInterval) clearInterval(this.timerInterval);
  }

  async toggleRecording() {
     if (this.isRecording() || this.isCountingDown()) {
         this.stopRecording();
     } else {
         await this.startRecording();
     }
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
       if (event.target instanceof HTMLButtonElement) {
          return; 
       }
       event.preventDefault();
       this.toggleRecording();
    }
  }

  handleCameraDragStart(event: MouseEvent) {
      if (this.isRecording() || this.isCountingDown()) return;
      this.isDraggingCam = true;
      this.dragStart = { x: event.clientX, y: event.clientY };
      this.dragInitialPos = { ...this.cameraPos() };
      event.preventDefault();
  }

  handleMouseMove(event: MouseEvent) {
      if (!this.isDraggingCam) return;
      const dx = event.clientX - this.dragStart.x;
      const dy = event.clientY - this.dragStart.y;
      this.cameraPos.set({ 
          x: this.dragInitialPos.x + dx, 
          y: this.dragInitialPos.y + dy 
      });
  }

  handleMouseUp() {
      this.isDraggingCam = false;
  }

  async toggleCamera() {
      if (this.isCameraEnabled()) {
          this.cameraStream()?.getTracks().forEach(t => t.stop());
          this.cameraStream.set(null);
          this.isCameraEnabled.set(false);
          this.cameraError.set(null);
      } else {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ 
                  video: { 
                      width: { ideal: 640 }, 
                      height: { ideal: 480 }, 
                      frameRate: { ideal: 60 },
                      facingMode: 'user' 
                  } 
              });

              // Tạo một track audio im lặng bằng Web Audio để ngăn chặn việc Chromium tối ưu hóa (throttling/suspending) video ở background sau 1 phút
              try {
                  const audioCtx = new AudioContext();
                  const silenceDest = audioCtx.createMediaStreamDestination();
                  const silentTrack = silenceDest.stream.getAudioTracks()[0];
                  if (silentTrack) {
                      stream.addTrack(silentTrack);
                  }
              } catch (e) {
                  console.error('Không thể tự động tiêm track im lặng:', e);
              }

              this.cameraStream.set(stream);
              this.isCameraEnabled.set(true);
              this.deviceDetector.cameraPermission.set('granted');
              this.cameraError.set(null);
              this.deviceDetector.checkCameraStatus();
              
              // Cập nhật lại srcObject sau khi view render
              setTimeout(() => {
                  const videoEle = document.getElementById('camPreview') as HTMLVideoElement;
                  if (videoEle) {
                      videoEle.srcObject = stream;
                      videoEle.muted = false; // Đảm bảo không bị tắt tiếng để tránh bị đóng băng video trong tab nền
                      videoEle.volume = 0.001; // Sử dụng âm lượng siêu nhỏ (thực tế im lặng tuyệt đối vì track chứa silence)
                  }
              }, 50);
          } catch (err) {
              const errorName = (err instanceof Error) ? err.name : '';
              if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
                  this.deviceDetector.cameraPermission.set('denied');
              }
              this.cameraError.set('Camera không khả dụng hoặc bị chặn');
              this.deviceDetector.checkCameraStatus();
          }
      }
  }

  async startRecording() {
    this.errorMessage.set('');
    this.recordingAttempted.set(true);
    try {
      // 1. Lấy luồng hình ảnh màn hình và âm thanh hệ thống (nếu user share)
      const idealFps = this.isCameraEnabled() ? 30 : 60;
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

      // 2. Lấy luồng mic (Tùy máy có thể không có mic, bọc try-catch nhẹ)
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
        this.errorMessage.set("Không tìm thấy Microphone, sẽ chỉ ghi hình và âm thanh hệ thống (nếu có).");
        setTimeout(() => this.errorMessage.set(''), 5000);
      }

      // 3. Tiến hành gộp (Mix) các luồng âm thanh bằng Web Audio API
      this.audioCtx = new AudioContext({ sampleRate: 48000 });
      const dest = this.audioCtx.createMediaStreamDestination();
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 32;

      let hasAudio = false;

      // Đưa âm thanh hệ thống vào mixer
      if (this.displayStream.getAudioTracks().length > 0) {
        const displayAudioSource = this.audioCtx.createMediaStreamSource(new MediaStream([this.displayStream.getAudioTracks()[0]]));
        displayAudioSource.connect(dest);
        displayAudioSource.connect(this.analyserNode);
        hasAudio = true;
      }

      // Đưa âm thanh micro vào mixer
      if (this.micStream && this.micStream.getAudioTracks().length > 0) {
        const micAudioSource = this.audioCtx.createMediaStreamSource(this.micStream);
        micAudioSource.connect(dest);
        micAudioSource.connect(this.analyserNode);
        hasAudio = true;
      }

      // 4. Gom Video và Audio đã Mix thành một MediaStream duy nhất
      let videoTracks = this.displayStream.getVideoTracks();
      
      if (this.isCameraEnabled() && this.cameraStream()) {
          this.displayVideoEle = document.createElement('video');
          this.displayVideoEle.muted = true;
          this.displayVideoEle.autoplay = true;
          this.displayVideoEle.playsInline = true;
          
          this.displayVideoEle.srcObject = this.displayStream;
          
          await new Promise<void>((resolve) => {
              this.displayVideoEle!.onloadedmetadata = () => {
                  this.displayVideoEle!.play();
                  this.canvasEle = document.createElement('canvas');
                  
                  // Cap canvas size at 1080p max resolution to prevent high-DPI performance choke
                  let targetWidth = this.displayVideoEle!.videoWidth;
                  let targetHeight = this.displayVideoEle!.videoHeight;
                  const MAX_RESOLUTION = 1920;
                  if (targetWidth > MAX_RESOLUTION) {
                      const scaleFactor = MAX_RESOLUTION / targetWidth;
                      targetWidth = MAX_RESOLUTION;
                      targetHeight = Math.round(targetHeight * scaleFactor);
                  }
                  
                  this.canvasEle.width = targetWidth;
                  this.canvasEle.height = targetHeight;
                  
                  // Create non-alpha canvas context for heavy CPU/GPU memory saving
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
                  isCameraEnabled: this.isCameraEnabled(),
                  cameraPos: this.cameraPos(),
                  cameraSize: this.cameraSize(),
                  windowWidth: this.cachedWindowWidth,
                  windowHeight: this.cachedWindowHeight
              });
              isDrawingFrame = false;
          };

          // Sử dụng Web Worker để đảm bảo timer luôn tick đúng 30 FPS ngay cả khi tab bị giảm hiệu năng/backgrounded
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
              this.timerWorker.postMessage({ action: 'start', interval: 1000 / 30 });
          } catch (err) {
              console.error('Không thể khởi tạo timer worker, chuyển sang setInterval làm dự phòng:', err);
              this.timerWorker = null;
              // Dự phòng bằng setInterval nếu trình duyệt bị giới hạn Worker hoặc CSP ngăn chặn Blob URL
              const intervalId = window.setInterval(drawFrame, 1000 / 30);
              this.timerWorker = {
                  postMessage(message: unknown) {
                      console.log('Worker loop fallback:', message);
                  },
                  terminate() {
                      window.clearInterval(intervalId);
                  },
                  onmessage: null
              } as unknown as Worker;
          }

          videoTracks = this.canvasEle!.captureStream(30).getVideoTracks();
      }

      const tracks: MediaStreamTrack[] = [...videoTracks];
      
      // Chỉ gắn track audio nếu có ít nhất một nguồn âm thanh
      if (hasAudio) {
          tracks.push(...dest.stream.getAudioTracks());
      }

      this.combinedStream = new MediaStream(tracks);

      // Xử lý khi user bấm Dừng chia sẻ từ thanh điều hướng của trình duyệt
      this.displayStream.getVideoTracks()[0].onended = () => {
          if (this.isRecording()) {
              this.stopRecording();
          }
      };

      // 5. Chuẩn bị MediaRecorder lưu định dạng WebM
      this.recordedChunks = [];
      const types = [
        'video/webm; codecs=vp9,opus',
        'video/webm; codecs=vp8,opus',
        'video/webm'
      ];
      
      let videoBitsPerSecond = 8000000;
      let audioBitsPerSecond = 320000;
      
      const preset = this.qualityPreset();
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

      // Thay vì bắt đầu quay ngay, chúng ta đếm ngược 5 giây
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
              // Chuyển sang giai đoạn hiệu lệnh âm thanh
              this.countdownValue.set('ACTION!');
              
              const startRecordingAction = () => {
                  // Cắt file 1 giây 1 lần để nhồi dữ liệu (an toàn hơn cho video dài)
                  this.mediaRecorder!.start(1000); 
  
                  this.isRecording.set(true);
                  this.isCountingDown.set(false); // Chỉ ẩn màn hình đếm ngược khi quá trình ghi thực sự bắt đầu
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
        this.errorMessage.set("Không thể khởi động quay: Quyền chia sẻ màn hình bị từ chối.");
      } else {
        this.errorMessage.set("Không thể bắt đầu quay. Vui lòng cấp quyền hệ thống. (Mẹo: Nhớ tích chọn 'Chia sẻ âm thanh')");
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
          this.showSuccessToast.set(true);
          this.successMessage.set('Đã lưu video về máy!');
          setTimeout(() => this.showSuccessToast.set(false), 5000);
      }, 100);
      this.recordedChunks = [];
  }

  private cleanupStreams() {
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

      if (this.cameraStream()) {
          this.cameraStream()!.getTracks().forEach(t => t.stop());
          this.cameraStream.set(null);
          this.isCameraEnabled.set(false);
      }
      
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

