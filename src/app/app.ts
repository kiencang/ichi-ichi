import { ChangeDetectionStrategy, Component, computed, signal, OnDestroy, OnInit, inject, HostListener } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SettingsModal } from './settings-modal';
import { GuideModal } from './guide-modal';
import { DeviceDetector } from './device-detector';
import { SettingsService } from './settings.service';
import { RecordingService } from './recording.service';
import { DraggableCameraDirective } from './draggable-camera.directive';
import { ToastService } from './toast.service';
import { APP_CONFIG } from './constants';
import { FooterComponent } from './footer.component';
import { CountdownOverlayComponent } from './countdown-overlay.component';
import { RecordButtonComponent } from './record-button.component';
import { CameraToggleComponent } from './camera-toggle.component';
import { LanguageService } from './language.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    SettingsModal, 
    GuideModal, 
    MatIconModule, 
    DraggableCameraDirective,
    FooterComponent,
    CountdownOverlayComponent,
    RecordButtonComponent,
    CameraToggleComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(window:keydown)': 'handleKeydown($event)',
    '(window:resize)': 'updateCachedWindowSize()'
  }
})
export class App implements OnDestroy, OnInit {
  private deviceDetector = inject(DeviceDetector);
  private settingsService = inject(SettingsService);
  private recordingService = inject(RecordingService);
  public toastService = inject(ToastService);
  public lang = inject(LanguageService);

  isCameraEnabled = signal(false);
  cameraStream = signal<MediaStream | null>(null);
  cameraPos = signal({ x: APP_CONFIG.CONSTRAINTS.CAMERA_EDGE_PADDING, y: 0 });
  isDraggingCam = signal(false);

  cachedWindowWidth = APP_CONFIG.CONSTRAINTS.MAX_RESOLUTION;
  cachedWindowHeight = 1080;
  
  isRecording = this.recordingService.isRecording;
  isCountingDown = this.recordingService.isCountingDown;
  countdownValue = this.recordingService.countdownValue;
  recordingTime = this.recordingService.recordingTime;
  errorMessage = this.recordingService.errorMessage;
  showSuccessToast = this.toastService.show;
  successMessage = this.toastService.message;
  showGuideModal = signal(false);
  audioLevels = this.recordingService.audioLevels;
  
  qualityPreset = this.settingsService.qualityPreset;
  tempQualityPreset = this.settingsService.tempQualityPreset;
  cameraSize = this.settingsService.cameraSize;
  tempCameraSize = this.settingsService.tempCameraSize;
  uiMode = this.settingsService.uiMode;
  tempUiMode = this.settingsService.tempUiMode;
  fpsPreset = this.settingsService.fpsPreset;
  tempFpsPreset = this.settingsService.tempFpsPreset;
  showBorder = this.settingsService.showBorder;
  tempShowBorder = this.settingsService.tempShowBorder;
  borderColor = this.settingsService.borderColor;
  tempBorderColor = this.settingsService.tempBorderColor;
  tempLanguage = this.settingsService.tempLanguage;
  showSettingsModal = signal(false);

  hasMicDevice = this.deviceDetector.hasMicDevice;
  micPermission = this.deviceDetector.micPermission;
  hasCameraDevice = this.deviceDetector.hasCameraDevice;
  cameraPermission = this.deviceDetector.cameraPermission;
  cameraError = signal<string | null>(null);
  recordingAttempted = this.recordingService.recordingAttempted;
  
  version = APP_CONFIG.VERSION;


  @HostListener('window:resize')
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
      this.settingsService.syncTempFromSettings();
      this.showSettingsModal.set(true);
  }

  saveSettings() {
      this.settingsService.saveSettings();
      this.showSettingsModal.set(false);
      this.toastService.success(this.lang.translations().MSG_SETTINGS_SAVED);
  }

  resetToDefaultSettings() {
      this.settingsService.resetToDefault();
      this.showSettingsModal.set(false);
      this.toastService.success(this.lang.translations().MSG_SETTINGS_RESET);
  }

  updateCameraSize(event: Event) {
      const input = event.target as HTMLInputElement;
      this.tempCameraSize.set(Number(input.value));
  }

  async ngOnInit() {
      if (typeof window !== 'undefined') {
          this.updateCachedWindowSize();

          const initCamSize = this.cameraSize();
          this.cameraPos.set({ 
              x: this.cachedWindowWidth - initCamSize - APP_CONFIG.CONSTRAINTS.CAMERA_EDGE_PADDING, 
              y: this.cachedWindowHeight - initCamSize - APP_CONFIG.CONSTRAINTS.CAMERA_EDGE_PADDING 
          });
      }
      
      // Bắt sự kiện record hoàn thành để show thông báo cho App (vì ta đã tách ra)
      // ta có thể theo dõi effect nhưng để đơn giản có thể effect
      
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
                      frameRate: { ideal: 30 },
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
    await this.recordingService.startRecording({
        isCameraEnabled: this.isCameraEnabled(),
        cameraStream: this.cameraStream(),
        cameraPos: this.cameraPos(),
        cameraSize: this.cameraSize(),
        qualityPreset: this.qualityPreset(),
        fpsPreset: this.fpsPreset(),
        cachedWindowWidth: this.cachedWindowWidth,
        cachedWindowHeight: this.cachedWindowHeight,
        showBorder: this.showBorder(),
        borderColor: this.borderColor()
    });
  }

  stopRecording() {
      this.recordingService.stopRecording();
  }

  private cleanupStreams() {
      if (this.cameraStream()) {
          this.cameraStream()!.getTracks().forEach(t => t.stop());
          this.cameraStream.set(null);
          this.isCameraEnabled.set(false);
      }
      this.recordingService.cleanupStreams();
  }
}


