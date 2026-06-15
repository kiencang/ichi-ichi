import { Injectable, signal } from '@angular/core';
import { APP_CONFIG } from './constants';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  qualityPreset = signal<'high' | 'medium' | 'low'>(APP_CONFIG.DEFAULTS.QUALITY_PRESET);
  cameraSize = signal<number>(APP_CONFIG.DEFAULTS.CAMERA_SIZE);
  uiMode = signal<'default' | 'enhanced'>(APP_CONFIG.DEFAULTS.UI_MODE);
  fpsPreset = signal<30 | 60>(APP_CONFIG.DEFAULTS.FPS_PRESET);

  tempQualityPreset = signal<'high' | 'medium' | 'low'>(APP_CONFIG.DEFAULTS.QUALITY_PRESET);
  tempCameraSize = signal<number>(APP_CONFIG.DEFAULTS.CAMERA_SIZE);
  tempUiMode = signal<'default' | 'enhanced'>(APP_CONFIG.DEFAULTS.UI_MODE);
  tempFpsPreset = signal<30 | 60>(APP_CONFIG.DEFAULTS.FPS_PRESET);

  constructor() {
    this.loadSettings();
  }

  loadSettings() {
    if (typeof window !== 'undefined') {
      const storedQuality = localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEYS.QUALITY_PRESET) as 'high' | 'medium' | 'low';
      if (storedQuality && ['high', 'medium', 'low'].includes(storedQuality)) {
        this.qualityPreset.set(storedQuality);
        this.tempQualityPreset.set(storedQuality);
      }

      const storedSize = localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEYS.CAMERA_SIZE);
      if (storedSize && !isNaN(Number(storedSize))) {
        this.cameraSize.set(Number(storedSize));
        this.tempCameraSize.set(Number(storedSize));
      }

      const storedMode = localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEYS.UI_MODE) as 'default' | 'enhanced';
      if (storedMode && ['default', 'enhanced'].includes(storedMode)) {
        this.uiMode.set(storedMode);
        this.tempUiMode.set(storedMode);
      }

      const storedFps = localStorage.getItem(APP_CONFIG.LOCAL_STORAGE_KEYS.FPS_PRESET);
      if (storedFps && (storedFps === '30' || storedFps === '60')) {
        const fpsNum = Number(storedFps) as 30 | 60;
        this.fpsPreset.set(fpsNum);
        this.tempFpsPreset.set(fpsNum);
      }
    }
  }

  saveSettings() {
    const newQuality = this.tempQualityPreset();
    const newSize = this.tempCameraSize();
    const newMode = this.tempUiMode();
    const newFps = this.tempFpsPreset();

    this.qualityPreset.set(newQuality);
    this.cameraSize.set(newSize);
    this.uiMode.set(newMode);
    this.fpsPreset.set(newFps);

    if (typeof window !== 'undefined') {
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.QUALITY_PRESET, newQuality);
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.CAMERA_SIZE, newSize.toString());
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.UI_MODE, newMode);
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.FPS_PRESET, newFps.toString());
    }
  }

  resetToDefault() {
    this.qualityPreset.set(APP_CONFIG.DEFAULTS.QUALITY_PRESET);
    this.cameraSize.set(APP_CONFIG.DEFAULTS.CAMERA_SIZE);
    this.uiMode.set(APP_CONFIG.DEFAULTS.UI_MODE);
    this.fpsPreset.set(APP_CONFIG.DEFAULTS.FPS_PRESET);
    
    this.tempQualityPreset.set(APP_CONFIG.DEFAULTS.QUALITY_PRESET);
    this.tempCameraSize.set(APP_CONFIG.DEFAULTS.CAMERA_SIZE);
    this.tempUiMode.set(APP_CONFIG.DEFAULTS.UI_MODE);
    this.tempFpsPreset.set(APP_CONFIG.DEFAULTS.FPS_PRESET);
  }

  syncTempFromSettings() {
    this.tempQualityPreset.set(this.qualityPreset());
    this.tempCameraSize.set(this.cameraSize());
    this.tempUiMode.set(this.uiMode());
    this.tempFpsPreset.set(this.fpsPreset());
  }
}
