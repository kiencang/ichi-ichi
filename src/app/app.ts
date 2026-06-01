import { ChangeDetectionStrategy, Component, computed, signal, OnDestroy, OnInit } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:keydown)': 'handleKeydown($event)'
  }
})
export class App implements OnDestroy, OnInit {
  isRecording = signal(false);
  isCountingDown = signal(false);
  countdownValue = signal(3);
  recordingTime = signal(0);
  errorMessage = signal('');
  showSuccessToast = signal(false);
  successMessage = signal('');
  audioLevels = signal<number[]>([15, 15, 15, 15, 15, 15, 15, 15, 15, 15]);
  timerInterval: ReturnType<typeof setInterval> | null = null;
  countdownTimerInterval: ReturnType<typeof setInterval> | null = null;
  
  hasMicDevice = signal<boolean | null>(null);
  micPermission = signal<string | null>(null);

  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private combinedStream: MediaStream | null = null;
  private displayStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private animationFrameId: number | null = null;

  async ngOnInit() {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
          try {
             if (navigator.mediaDevices.addEventListener) {
                 navigator.mediaDevices.addEventListener('devicechange', () => this.checkMicStatus());
             }
             await this.checkMicStatus();

             if (navigator.permissions && (navigator.permissions as any).query) {
                 try {
                     const perm = await navigator.permissions.query({ name: 'microphone' as any });
                     this.micPermission.set(perm.state);
                     perm.onchange = () => this.micPermission.set(perm.state);
                 } catch (e) {
                     // Safari sometimes doesn't support 'microphone' in permissions API
                 }
             }
          } catch (e) {
              // Ignore securely
          }
      }
  }

  async checkMicStatus() {
     try {
         const devices = await navigator.mediaDevices.enumerateDevices();
         const hasMic = devices.some(d => d.kind === 'audioinput');
         this.hasMicDevice.set(hasMic);
     } catch (e) {
         this.hasMicDevice.set(null);
     }
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

  async startRecording() {
    this.errorMessage.set('');
    try {
      // 1. Lấy luồng hình ảnh màn hình và âm thanh hệ thống (nếu user share)
      this.displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          displaySurface: 'monitor',
          frameRate: { ideal: 60, max: 60 }
        } as MediaTrackConstraints, 
        audio: true
      });

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
      } catch {
        this.errorMessage.set("Không tìm thấy Microphone, sẽ chỉ ghi hình và âm thanh hệ thống (nếu có).");
        setTimeout(() => this.errorMessage.set(''), 5000);
      }

      // 3. Tiến hành gộp (Mix) các luồng âm thanh bằng Web Audio API
      this.audioCtx = new AudioContext();
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
      const tracks: MediaStreamTrack[] = [
          ...this.displayStream.getVideoTracks()
      ];
      
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
      
      const mimeType = types.find(type => MediaRecorder.isTypeSupported(type)) || '';
      const options = mimeType ? { mimeType, videoBitsPerSecond: 8000000, audioBitsPerSecond: 192000 } : { videoBitsPerSecond: 8000000, audioBitsPerSecond: 192000 };
      
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

      // Thay vì bắt đầu quay ngay, chúng ta đếm ngược 3 giây
      this.isCountingDown.set(true);
      this.countdownValue.set(3);

      this.countdownTimerInterval = setInterval(() => {
          const current = this.countdownValue();
          if (current > 1) {
              this.countdownValue.set(current - 1);
          } else {
              if (this.countdownTimerInterval !== null) {
                  clearInterval(this.countdownTimerInterval);
                  this.countdownTimerInterval = null;
              }
              this.isCountingDown.set(false);
              
              // Cắt file 1 giây 1 lần để nhồi dữ liệu (an toàn hơn cho video dài)
              this.mediaRecorder!.start(1000); 

              this.isRecording.set(true);
              this.recordingTime.set(0);
              this.timerInterval = setInterval(() => {
                  this.recordingTime.update(t => t + 1);
              }, 1000);

              if (hasAudio && this.analyserNode) {
                  this.updateAudioLevels();
              }
          }
      }, 1000);

    } catch {
      this.errorMessage.set("Không thể bắt đầu quay. Vui lòng cấp quyền hệ thống. (Mẹo: Nhớ tích chọn 'Chia sẻ âm thanh')");
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
      const fn = `ScreenRecord_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.webm`;
      
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

