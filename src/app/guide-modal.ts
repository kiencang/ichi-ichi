import { ChangeDetectionStrategy, Component, model, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-guide-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-[110] flex items-center justify-center bg-[#070b14]/85 backdrop-blur-sm transition-all p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-[716px] overflow-hidden flex flex-col max-h-[90vh]"
             [class.max-w-[760px]]="uiMode() === 'enhanced'">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/50">
            <h2 class="text-slate-200 font-medium flex flex-wrap items-center gap-2"
                [class.text-xl]="uiMode() === 'enhanced'" [class.font-bold]="uiMode() === 'enhanced'"
                [class.text-lg]="uiMode() !== 'enhanced'">
              <mat-icon class="w-5 h-5 text-slate-400 shrink-0">help_outline</mat-icon>
              <span>Hướng dẫn sử dụng 
                <span class="font-normal inline-block ml-1"
                      [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-300]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  [Dùng tốt nhất trên Windows, trình duyệt Chrome hoặc Edge]
                </span>
              </span>
            </h2>
            <button (click)="show.set(false)" class="text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer flex items-center justify-center"
                    [class.scale-110]="uiMode() === 'enhanced'">
              <mat-icon class="!text-[20px] !w-[20px] !h-[20px]">close</mat-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <div class="space-y-6">
              <!-- Privacy Note -->
              <div class="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-3 items-start"
                   [class.bg-emerald-500/10]="uiMode() === 'enhanced'" [class.border-emerald-500/30]="uiMode() === 'enhanced'">
                <mat-icon class="!text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] shrink-0 mt-0.5 !text-[20px] !w-[20px] !h-[20px]"
                     [class.!text-[24px]]="uiMode() === 'enhanced'" [class.!w-[24px]]="uiMode() === 'enhanced'" [class.!h-[24px]]="uiMode() === 'enhanced'">verified_user</mat-icon>
                <div class="space-y-1">
                  <h4 class="font-bold text-emerald-400 uppercase tracking-wider"
                      [class.text-sm]="uiMode() === 'enhanced'"
                      [class.text-xs]="uiMode() !== 'enhanced'">Bảo mật &amp; Riêng tư</h4>
                  <p class="leading-relaxed font-sans"
                     [class.text-sm]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                     [class.text-xs]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                    <strong>Lưu ý:</strong> Công cụ này xử lý việc ghi âm và ghi hình hoàn toàn trực tiếp trên trình duyệt máy tính của bạn. Trang web cam kết không nhận, không gửi và không lưu giữ bất kỳ hình ảnh hay âm thanh nào của người dùng lên máy chủ.
                  </p>
                </div>
              </div>

              <hr class="border-slate-800/60">

              <!-- Step 1 -->
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span class="flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0"
                        [class.w-9]="uiMode() === 'enhanced'" [class.h-9]="uiMode() === 'enhanced'" [class.text-base]="uiMode() === 'enhanced'"
                        [class.w-7]="uiMode() !== 'enhanced'" [class.h-7]="uiMode() !== 'enhanced'" [class.text-sm]="uiMode() !== 'enhanced'">1</span>
                  <h3 class="text-slate-300 font-medium"
                      [class.text-lg]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-base]="uiMode() !== 'enhanced'">Cấp quyền Thu âm thanh (Micro) & Webcam</h3>
                </div>
                <p class="pl-10 leading-relaxed"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  Để ứng dụng có thể thu được tiếng từ micro hoặc/và video webcam của bạn (nếu bạn muốn), vui lòng <strong>Cho phép (Allow)</strong> trình duyệt sử dụng micro, webcam khi được yêu cầu.
                </p>
                <div class="pl-10">
                  <div class="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/30">
                    <img src="cap-quyen-2.png" alt="Hướng dẫn cấp quyền micro" class="w-full h-auto" referrerpolicy="no-referrer" />
                  </div>
                </div>
                <p class="pl-10 leading-relaxed"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  Nếu lỡ tay bấm chặn (Không bao giờ cho phép), bạn có thể bấm biểu tượng Cài đặt trên thanh địa chỉ của trình duyệt, rồi click tiếp biểu tượng Micro (hoặc/và Camera) có thanh gạch chéo để cấp quyền lại.
                </p>
                <div class="pl-10">
                  <div class="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/30">
                    <img src="cap-quyen-3.png" alt="Hướng dẫn cấp lại quyền khi bị chặn" class="w-full h-auto" referrerpolicy="no-referrer" />
                  </div>
                </div>
              </div>

              <hr class="border-slate-800/60 ml-10">

              <!-- Step 2 -->
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span class="flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0"
                        [class.w-9]="uiMode() === 'enhanced'" [class.h-9]="uiMode() === 'enhanced'" [class.text-base]="uiMode() === 'enhanced'"
                        [class.w-7]="uiMode() !== 'enhanced'" [class.h-7]="uiMode() !== 'enhanced'" [class.text-sm]="uiMode() !== 'enhanced'">2</span>
                  <h3 class="text-slate-300 font-medium"
                      [class.text-lg]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-base]="uiMode() !== 'enhanced'">Cấp quyền Chia sẻ màn hình</h3>
                </div>
                <p class="pl-10 leading-relaxed"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  Khi bạn bấm nút bắt đầu quay (nút đỏ giữa màn hình), trình duyệt web sẽ yêu cầu bạn cấp quyền chia sẻ màn hình. Hãy chọn nội dung bạn muốn chia sẻ (toàn bộ màn hình, hoặc một cửa sổ) và bấm nút <strong>Chia sẻ (Share)</strong>. Ở bước này, bạn cũng có thể bật tính năng chia sẻ âm thanh hệ thống trên hộp thoại để ghi được âm thanh phát ra từ máy tính.
                </p>
                <div class="pl-10">
                  <div class="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/30">
                    <img src="cap-quyen-1.png" alt="Hướng dẫn cấp quyền chia sẻ màn hình" class="w-full h-auto" referrerpolicy="no-referrer" />
                  </div>
                </div>
              </div>

              <hr class="border-slate-800/60 ml-10">

              <!-- Step 3 -->
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span class="flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0"
                        [class.w-9]="uiMode() === 'enhanced'" [class.h-9]="uiMode() === 'enhanced'" [class.text-base]="uiMode() === 'enhanced'"
                        [class.w-7]="uiMode() !== 'enhanced'" [class.h-7]="uiMode() !== 'enhanced'" [class.text-sm]="uiMode() !== 'enhanced'">3</span>
                  <h3 class="text-slate-300 font-medium"
                      [class.text-lg]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-base]="uiMode() !== 'enhanced'">Chuẩn bị trước khi quay</h3>
                </div>
                <p class="pl-10 leading-relaxed"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  Khi quá trình quay màn hình bắt đầu, chương trình sẽ đếm lùi 5s để bạn chuẩn bị, và chỉ chính thức ghi sau khi âm thanh Action vang lên.
                </p>
              </div>

              <hr class="border-slate-800/60 ml-10">

              <!-- Step 4 -->
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span class="flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0"
                        [class.w-9]="uiMode() === 'enhanced'" [class.h-9]="uiMode() === 'enhanced'" [class.text-base]="uiMode() === 'enhanced'"
                        [class.w-7]="uiMode() !== 'enhanced'" [class.h-7]="uiMode() !== 'enhanced'" [class.text-sm]="uiMode() !== 'enhanced'">4</span>
                  <h3 class="text-slate-300 font-medium"
                      [class.text-lg]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-base]="uiMode() !== 'enhanced'">Vị trí lưu video</h3>
                </div>
                <p class="pl-10 leading-relaxed"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  Sau khi bạn bấm dừng ghi hình, video sẽ được tự động xử lý và tải về máy tính (quá trình này hoàn toàn offline). Theo mặc định, video sẽ nằm trong <strong>thư mục Downloads (Tải xuống)</strong> của máy tính với tên dạng <code>[Ichi_Ichi_SR]_[Ngay_Thang_Nam]_[Gio_Phut_Giay].webm</code>. Bạn có thể mở mục "Nội dung tải xuống" (Downloads) trên trình duyệt để mở video.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class GuideModal {
  show = model(false);
  uiMode = input<'default' | 'enhanced'>('default');
}
