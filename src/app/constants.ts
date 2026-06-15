export const APP_CONFIG = {
  VERSION: 'v1.0.31',
  LOCAL_STORAGE_KEYS: {
    QUALITY_PRESET: 'ichi_qualityPreset',
    CAMERA_SIZE: 'ichi_cameraSize',
    UI_MODE: 'ichi_uiMode',
    FPS_PRESET: 'ichi_fpsPreset',
  },
  DEFAULTS: {
    CAMERA_SIZE: 120,
    QUALITY_PRESET: 'medium' as const,
    UI_MODE: 'default' as const,
    FPS_PRESET: 30 as const,
  },
  CONSTRAINTS: {
    MAX_RESOLUTION: 1920,
    CAMERA_SNAP_THRESHOLD: 150,
    CAMERA_EDGE_PADDING: 20,
  }
};

export const MESSAGES = {
  ERRORS: {
    MIC_NOT_FOUND: 'Không tìm thấy Microphone, sẽ chỉ ghi hình và âm thanh hệ thống (nếu có).',
    SCREEN_SHARE_DENIED: 'Không thể khởi động quay: Quyền chia sẻ màn hình bị từ chối.',
    GENERAL_RECORD_ERROR: "Không thể bắt đầu quay. Vui lòng cấp quyền hệ thống. (Mẹo: Nhớ tích chọn 'Chia sẻ âm thanh')"
  },
  SUCCESS: {
    SETTINGS_SAVED: 'Đã lưu cài đặt thành công!',
    SETTINGS_RESET: 'Các cài đặt đã được chuyển về mặc định',
    VIDEO_SAVED: 'Đã lưu video về máy!',
  }
};
