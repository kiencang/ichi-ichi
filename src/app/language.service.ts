import { Injectable, computed, inject } from '@angular/core';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private settingsService = inject(SettingsService);

  // Expose current language signal
  currentLanguage = computed(() => this.settingsService.language());

  // Comprehensive Translation Dictionary
  private dictionary = {
    vi: {
      // General
      SETTINGS: 'Cài đặt',
      USER_GUIDE: 'Hướng dẫn sử dụng',
      GITHUB: 'GitHub',
      COPYRIGHT: 'Nguyễn Đức Anh',
      CLOSE: 'Đóng',
      CANCEL: 'Hủy',
      WARNING: 'Cảnh báo',
      ERROR: 'Lỗi',
      SUCCESS: 'Thành công',
      CAMERA: 'CAMERA',
      
      // Home & Main screen
      MIC_UNAVAILABLE: 'Micro không khả dụng hoặc bị chặn',
      STOP_RECORDING_TITLE: 'Dừng quay',
      START_RECORDING_TITLE: 'Click để bắt đầu quay màn hình',
      PREPARING_TEXT: 'Chuẩn bị quay màn hình...',
      COUNTDOWN_CANCEL: 'Hủy',
      DRAG_CAMERA_HINT: 'Kéo để di chuyển camera',

      // Settings Modal General
      SETTINGS_TITLE: 'Cài đặt chất lượng ghi & Webcam',
      SETTINGS_RESET: 'Chuyển về mặc định',
      SETTINGS_CANCEL: 'Không lưu',
      SETTINGS_SAVE: 'Lưu cấu hình',

      // Column 1: Chất lượng ghi hình
      COL_QUALITY_TITLE: 'Chất lượng ghi hình',
      QUALITY_LOW: 'Thấp',
      QUALITY_MEDIUM: 'Trung bình',
      QUALITY_HIGH: 'Cao',
      QUALITY_LOW_DESC: 'Phù hợp để lưu trữ nhanh, tiết kiệm dung lượng',
      QUALITY_MEDIUM_DESC: 'Cân bằng hoàn hảo giữa dung lượng và độ sắc nét',
      QUALITY_HIGH_DESC: 'Khuyên dùng cho văn bản, bài giảng chi tiết',
      BITRATE_PREFIX: 'Bitrate',
      BITRATE_LOW_DETAIL: 'Video 2 Mbps (Audio 128 Kbps)',
      BITRATE_MEDIUM_DETAIL: 'Video 4 Mbps (Audio 192 Kbps)',
      BITRATE_HIGH_DETAIL: 'Video 8 Mbps (Audio 320 Kbps)',

      // Column 2: Tốc độ khung hình & Cài đặt viền Webcam
      COL_FPS_TITLE: 'Tốc độ khung hình (FPS)',
      FPS_SMOOTH: 'Mượt mà',
      FPS_ULTRA: 'Cực mượt',
      FPS_SMOOTH_DESC: 'Độ mượt tiêu chuẩn phù hợp cho hầu hết nội dung',
      FPS_ULTRA_DESC: 'Khuyên dùng khi quay video game hoặc thao tác nhanh',
      
      COL_BORDER_TITLE: 'Cài đặt viền Webcam',
      BORDER_ENABLE: 'Hiển thị viền camera',
      BORDER_COLOR: 'Màu viền',

      // Column 3: Chế độ giao diện, Kích cỡ Webcam & Ngôn ngữ ứng dụng
      COL_UI_TITLE: 'Chế độ giao diện',
      UI_DEFAULT: 'Mặc định',
      UI_ENHANCED: 'Tăng cường',
      UI_TOOLTIP: 'Dành cho người cao tuổi hoặc gặp vấn đề về thị lực.',
      
      COL_WEBCAM_SIZE_TITLE: 'Kích cỡ Webcam',
      SIZE_SMALL: 'Nhỏ',
      SIZE_MEDIUM: 'Vừa',
      SIZE_LARGE: 'Lớn',
      
      COL_LANG_TITLE: 'Ngôn ngữ ứng dụng',
      LANG_VI: 'Tiếng Việt',
      LANG_EN: 'English',

      // Toast Messages
      MSG_MIC_NOT_FOUND: 'Không tìm thấy Microphone, sẽ chỉ ghi hình và âm thanh hệ thống (nếu có).',
      MSG_SCREEN_SHARE_DENIED: 'Không thể khởi động quay: Quyền chia sẻ màn hình bị từ chối.',
      MSG_GENERAL_RECORD_ERROR: "Không thể bắt đầu quay. Vui lòng cấp quyền hệ thống. (Mẹo: Nhớ tích chọn 'Chia sẻ âm thanh')",
      MSG_SETTINGS_SAVED: 'Đã lưu cài đặt thành công!',
      MSG_SETTINGS_RESET: 'Các cài đặt đã được chuyển về mặc định',
      MSG_VIDEO_SAVED: 'Đã lưu video về máy!',

      // Guide Modal
      GUIDE_BEST_COMPATIBILITY: '[Dùng tốt nhất trên Windows, trình duyệt Chrome hoặc Edge]',
      GUIDE_PRIVACY_TITLE: 'Bảo mật & Riêng tư',
      GUIDE_PRIVACY_BODY: 'Lưu ý: Công cụ này xử lý việc ghi âm và ghi hình hoàn toàn trực tiếp trên trình duyệt máy tính của bạn. Trang web cam kết không nhận, không gửi và không lưu giữ bất kỳ hình ảnh hay âm thanh nào của người dùng lên máy chủ.',
      
      GUIDE_STEP_1: 'Cấp quyền Thu âm thanh (Micro) & Webcam',
      GUIDE_STEP_1_BODY: 'Để ứng dụng có thể thu được tiếng từ micro hoặc/và video webcam của bạn (nếu bạn muốn), vui lòng Cho phép (Allow) trình duyệt sử dụng micro, webcam khi được yêu cầu.',
      GUIDE_STEP_1_ALT1: 'Hướng dẫn cấp quyền micro',
      GUIDE_STEP_1_TIPS: 'Nếu lỡ tay bấm chặn (Không bao giờ cho phép), bạn có thể bấm biểu tượng Cài đặt trên thanh địa chỉ của trình duyệt, rồi click tiếp biểu tượng Micro (hoặc/và Camera) có thanh gạch chéo để cấp quyền lại.',
      GUIDE_STEP_1_ALT2: 'Hướng dẫn cấp lại quyền khi bị chặn',
      
      GUIDE_STEP_2: 'Cấp quyền Chia sẻ màn hình',
      GUIDE_STEP_2_BODY: "Khi bạn bấm nút bắt đầu quay (nút đỏ giữa màn hình), trình duyệt web sẽ yêu cầu bạn cấp quyền chia sẻ màn hình. Hãy chọn nội dung bạn muốn chia sẻ (toàn bộ màn hình, hoặc một cửa sổ) và bấm nút Chia sẻ (Share). Ở bước này, bạn cũng có thể bật tính năng chia sẻ âm thanh hệ thống trên hộp thoại để ghi được âm thanh phát ra từ máy tính.",
      GUIDE_STEP_2_ALT1: 'Hướng dẫn cấp quyền chia sẻ màn hình',
      
      GUIDE_STEP_3: 'Chuẩn bị trước khi quay',
      GUIDE_STEP_3_BODY: 'Khi quá trình quay màn hình bắt đầu, chương trình sẽ đếm lùi 5s để bạn chuẩn bị, và chỉ chính thức ghi sau khi âm thanh Action vang lên.',
      
      GUIDE_STEP_4: 'Vị trí lưu video',
      GUIDE_STEP_4_BODY: 'Sau khi bạn bấm dừng ghi hình, video sẽ được tự động xử lý và tải về máy tính (quá trình này hoàn toàn offline). Theo mặc định, video sẽ nằm trong thư mục Downloads (Tải xuống) của máy tính với tên dạng [Ichi_Ichi_SR]_[Ngay_Thang_Nam]_[Gio_Phut_Giay].webm. Bạn có thể mở mục "Nội dung tải xuống" (Downloads) trên trình duyệt để mở video.'
    },
    en: {
      // General
      SETTINGS: 'Settings',
      USER_GUIDE: 'User Guide',
      GITHUB: 'GitHub',
      COPYRIGHT: 'Nguyen Duc Anh',
      CLOSE: 'Close',
      CANCEL: 'Cancel',
      WARNING: 'Warning',
      ERROR: 'Error',
      SUCCESS: 'Success',
      CAMERA: 'CAMERA',
      
      // Home & Main screen
      MIC_UNAVAILABLE: 'Microphone unavailable or blocked',
      STOP_RECORDING_TITLE: 'Stop recording',
      START_RECORDING_TITLE: 'Click to start screen recording',
      PREPARING_TEXT: 'Preparing screen recording...',
      COUNTDOWN_CANCEL: 'Cancel',
      DRAG_CAMERA_HINT: 'Drag to reposition camera',

      // Settings Modal General
      SETTINGS_TITLE: 'Recording Quality & Webcam Settings',
      SETTINGS_RESET: 'Restore defaults',
      SETTINGS_CANCEL: 'Cancel',
      SETTINGS_SAVE: 'Save changes',

      // Column 1: Chất lượng ghi hình
      COL_QUALITY_TITLE: 'Recording Quality',
      QUALITY_LOW: 'Low',
      QUALITY_MEDIUM: 'Medium',
      QUALITY_HIGH: 'High',
      QUALITY_LOW_DESC: 'Suitable for quick recording, saves space',
      QUALITY_MEDIUM_DESC: 'Perfect balance between size and quality',
      QUALITY_HIGH_DESC: 'Recommended for documents and slides',
      BITRATE_PREFIX: 'Bitrate',
      BITRATE_LOW_DETAIL: 'Video 2 Mbps (Audio 128 Kbps)',
      BITRATE_MEDIUM_DETAIL: 'Video 4 Mbps (Audio 192 Kbps)',
      BITRATE_HIGH_DETAIL: 'Video 8 Mbps (Audio 320 Kbps)',

      // Column 2: Tốc độ khung hình & Cài đặt viền Webcam
      COL_FPS_TITLE: 'Frame Rate (FPS)',
      FPS_SMOOTH: 'Smooth',
      FPS_ULTRA: 'Ultra Smooth',
      FPS_SMOOTH_DESC: 'Standard smoothness suitable for most captures',
      FPS_ULTRA_DESC: 'Best for capturing games or fast interactions',
      
      COL_BORDER_TITLE: 'Webcam Border Settings',
      BORDER_ENABLE: 'Show camera border',
      BORDER_COLOR: 'Border color',

      // Column 3: Chế độ giao diện, Kích cỡ Webcam & Ngôn ngữ ứng dụng
      COL_UI_TITLE: 'Interface Mode',
      UI_DEFAULT: 'Default',
      UI_ENHANCED: 'Enhanced',
      UI_TOOLTIP: 'Optimized for seniors or users with visual challenges.',
      
      COL_WEBCAM_SIZE_TITLE: 'Webcam Size',
      SIZE_SMALL: 'Small',
      SIZE_MEDIUM: 'Medium',
      SIZE_LARGE: 'Large',
      
      COL_LANG_TITLE: 'App Language',
      LANG_VI: 'Tiếng Việt',
      LANG_EN: 'English',

      // Toast Messages
      MSG_MIC_NOT_FOUND: 'Microphone not found. Only screen visual and system audio will be captured.',
      MSG_SCREEN_SHARE_DENIED: 'Cannot start: Screen recording privilege was denied.',
      MSG_GENERAL_RECORD_ERROR: "Cannot start recording. Please allow browser controls. (Tip: Toggle the 'Share Audio' option)",
      MSG_SETTINGS_SAVED: 'Configuration saved successfully!',
      MSG_SETTINGS_RESET: 'Configuration reset to factory defaults',
      MSG_VIDEO_SAVED: 'Video saved to device successfully!',

      // Guide Modal
      GUIDE_BEST_COMPATIBILITY: '[Best working on Windows, Chrome or Edge browsers]',
      GUIDE_PRIVACY_TITLE: 'Privacy & Security',
      GUIDE_PRIVACY_BODY: 'Note: This utility records and renders video and audio fully local to your browser. No personal records, assets or streams are shared or sent to any server.',
      
      GUIDE_STEP_1: 'Allow Microphone & Webcam Access',
      GUIDE_STEP_1_BODY: 'To record sound and capture your custom presenter overlay, please choose "Allow" when the browser prompts for mic/cam access.',
      GUIDE_STEP_1_ALT1: 'Microphone access permission details',
      GUIDE_STEP_1_TIPS: 'If permissions were blocked, click the Settings/Lock symbol in your address bar, then enable the Microphone and Site Camera switches.',
      GUIDE_STEP_1_ALT2: 'Instructions on restoring permissions',
      
      GUIDE_STEP_2: 'Allow Screen Capturing',
      GUIDE_STEP_2_BODY: "Once you lock-in on the big middle capture button, your browser of choice queries for capture layout. Choose entire display or an application page, then click 'Share'. Do not forget to check system audio sharing before proceeding.",
      GUIDE_STEP_2_ALT1: 'Screen sharing permission guide',
      
      GUIDE_STEP_3: 'Prepare to Capture',
      GUIDE_STEP_3_BODY: 'Before starting, a 5-second countdown triggers so you can position your layouts. Streaming strictly initiates after the action voice chime.',
      
      GUIDE_STEP_4: 'Output Directory',
      GUIDE_STEP_4_BODY: 'As you press stop recording, the video prepares and launches in local browser memory. By default, finding your assets is done on local Downloads directory under names starting with [Ichi_Ichi_SR]_[Day_Month_Year]_[Hour_Minute_Second].webm. Review Downloads page in browser history to play the file.'
    }
  };

  // Signal translations object
  translations = computed(() => this.dictionary[this.currentLanguage()]);
}
