import { Injectable, signal, effect } from '@angular/core';
import { APP_CONFIG } from './constants';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  qualityPreset = signal<'high' | 'medium' | 'low'>(APP_CONFIG.DEFAULTS.QUALITY_PRESET);
  cameraSize = signal<number>(APP_CONFIG.DEFAULTS.CAMERA_SIZE);
  uiMode = signal<'default' | 'enhanced'>(APP_CONFIG.DEFAULTS.UI_MODE);

  tempQualityPreset = signal<'high' | 'medium' | 'low'>(APP_CONFIG.DEFAULTS.QUALITY_PRESET);
  tempCameraSize = signal<number>(APP_CONFIG.DEFAULTS.CAMERA_SIZE);
  tempUiMode = signal<'default' | 'enhanced'>(APP_CONFIG.DEFAULTS.UI_MODE);

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
    }
  }

  saveSettings() {
    const newQuality = this.tempQualityPreset();
    const newSize = this.tempCameraSize();
    const newMode = this.tempUiMode();

    this.qualityPreset.set(newQuality);
    this.cameraSize.set(newSize);
    this.uiMode.set(newMode);

    if (typeof window !== 'undefined') {
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.QUALITY_PRESET, newQuality);
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.CAMERA_SIZE, newSize.toString());
      localStorage.setItem(APP_CONFIG.LOCAL_STORAGE_KEYS.UI_MODE, newMode);
    }
  }

  resetToDefault() {
    this.qualityPreset.set(APP_CONFIG.DEFAULTS.QUALITY_PRESET);
    this.cameraSize.set(APP_CONFIG.DEFAULTS.CAMERA_SIZE);
    this.uiMode.set(APP_CONFIG.DEFAULTS.UI_MODE);
    
    this.tempQualityPreset.set(APP_CONFIG.DEFAULTS.QUALITY_PRESET);
    this.tempCameraSize.set(APP_CONFIG.DEFAULTS.CAMERA_SIZE);
    this.tempUiMode.set(APP_CONFIG.DEFAULTS.UI_MODE);
  }

  syncTempFromSettings() {
    this.tempQualityPreset.set(this.qualityPreset());
    this.tempCameraSize.set(this.cameraSize());
    this.tempUiMode.set(this.uiMode());
  }
}
