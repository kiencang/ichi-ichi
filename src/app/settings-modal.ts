import { ChangeDetectionStrategy, Component, model, output } from '@angular/core';

@Component({
  selector: 'app-settings-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-[110] flex items-center justify-center bg-transparent transition-all p-4">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col transition-all duration-300"
             [class.max-w-4xl]="tempUiMode() === 'enhanced'"
             [class.max-w-3xl]="tempUiMode() !== 'enhanced'">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 class="font-semibold text-slate-100 flex items-center gap-2"
                [class.text-xl]="tempUiMode() === 'enhanced'" [class.font-bold]="tempUiMode() === 'enhanced'"
                [class.text-lg]="tempUiMode() !== 'enhanced'">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-slate-400"
                   [class.w-6]="tempUiMode() === 'enhanced'" [class.h-6]="tempUiMode() === 'enhanced'">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cài đặt chất lượng
            </h2>
            <button (click)="show.set(false)" class="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                    [class.scale-110]="tempUiMode() === 'enhanced'">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="px-6 py-5 overflow-y-auto w-full flex-1">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              
              <!-- Left Column: Quality Settings -->
              <div class="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 md:p-5 space-y-4 shadow-inner">
                <h3 class="font-medium text-slate-200 select-none pb-2 border-b border-slate-800/50 flex items-center gap-2"
                    [class.text-base]="tempUiMode() === 'enhanced'" [class.font-semibold]="tempUiMode() === 'enhanced'"
                    [class.text-sm]="tempUiMode() !== 'enhanced'">
                  <span class="w-1.5 h-1.5 rounded-full animate-[pulse_2s_infinite]"
                        [class.bg-emerald-500]="tempUiMode() !== 'enhanced'"
                        [class.bg-amber-500]="tempUiMode() === 'enhanced'"></span>
                  Chất lượng ghi hình
                </h3>
                
                <div class="space-y-3">
                  <label class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors"
                      [class.bg-slate-800]="tempQualityPreset() === 'high'" [class.border-emerald-500]="tempUiMode() !== 'enhanced' && tempQualityPreset() === 'high'" [class.border-amber-500]="tempUiMode() === 'enhanced' && tempQualityPreset() === 'high'"
                      [class.bg-slate-850/40]="tempQualityPreset() !== 'high'" [class.border-slate-800/70]="tempQualityPreset() !== 'high'"
                      [class.hover:border-slate-700]="tempQualityPreset() !== 'high'">
                    <div>
                      <div class="font-medium text-slate-200 border-none select-none"
                           [class.text-base]="tempUiMode() === 'enhanced'" [class.text-sm]="tempUiMode() !== 'enhanced'" [class.font-semibold]="tempUiMode() === 'enhanced'">Cao</div>
                      <div class="mt-1"
                           [class.text-sm]="tempUiMode() === 'enhanced'" [class.text-slate-300]="tempUiMode() === 'enhanced'"
                           [class.text-xs]="tempUiMode() !== 'enhanced'" [class.text-slate-400]="tempUiMode() !== 'enhanced'">Video: 8 Mbps, Audio: 320 kbps</div>
                    </div>
                    <input type="radio" name="quality" value="high" [checked]="tempQualityPreset() === 'high'" (change)="setQualityPreset('high')" class="hidden">
                    @if (tempQualityPreset() === 'high') {
                      <div class="rounded-full border-slate-900"
                           [class.bg-emerald-500]="tempUiMode() !== 'enhanced'" [class.shadow-[0_0_0_1px_rgba(16,185,129,1)]]="tempUiMode() !== 'enhanced'"
                           [class.bg-amber-500]="tempUiMode() === 'enhanced'" [class.shadow-[0_0_0_1px_rgba(245,158,11,1)]]="tempUiMode() === 'enhanced'"
                           [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'" [class.border-[4px]]="tempUiMode() === 'enhanced'"
                           [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'" [class.border-[3px]]="tempUiMode() !== 'enhanced'"></div>
                    } @else {
                      <div class="rounded-full border border-slate-600 shrink-0 select-none"
                           [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'"
                           [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'"></div>
                    }
                  </label>

                  <label class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors"
                      [class.bg-slate-800]="tempQualityPreset() === 'medium'" [class.border-emerald-500]="tempUiMode() !== 'enhanced' && tempQualityPreset() === 'medium'" [class.border-amber-500]="tempUiMode() === 'enhanced' && tempQualityPreset() === 'medium'"
                      [class.bg-slate-850/40]="tempQualityPreset() !== 'medium'" [class.border-slate-800/70]="tempQualityPreset() !== 'medium'"
                      [class.hover:border-slate-700]="tempQualityPreset() !== 'medium'">
                    <div>
                      <div class="font-medium text-slate-200 border-none select-none"
                           [class.text-base]="tempUiMode() === 'enhanced'" [class.text-sm]="tempUiMode() !== 'enhanced'" [class.font-semibold]="tempUiMode() === 'enhanced'">Trung bình (Mặc định)</div>
                      <div class="mt-1"
                           [class.text-sm]="tempUiMode() === 'enhanced'" [class.text-slate-300]="tempUiMode() === 'enhanced'"
                           [class.text-xs]="tempUiMode() !== 'enhanced'" [class.text-slate-400]="tempUiMode() !== 'enhanced'">Video: 4 Mbps, Audio: 192 kbps</div>
                    </div>
                    <input type="radio" name="quality" value="medium" [checked]="tempQualityPreset() === 'medium'" (change)="setQualityPreset('medium')" class="hidden">
                    @if (tempQualityPreset() === 'medium') {
                      <div class="rounded-full border-slate-900"
                           [class.bg-emerald-500]="tempUiMode() !== 'enhanced'" [class.shadow-[0_0_0_1px_rgba(16,185,129,1)]]="tempUiMode() !== 'enhanced'"
                           [class.bg-amber-500]="tempUiMode() === 'enhanced'" [class.shadow-[0_0_0_1px_rgba(245,158,11,1)]]="tempUiMode() === 'enhanced'"
                           [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'" [class.border-[4px]]="tempUiMode() === 'enhanced'"
                           [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'" [class.border-[3px]]="tempUiMode() !== 'enhanced'"></div>
                    } @else {
                      <div class="rounded-full border border-slate-600 shrink-0 select-none"
                           [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'"
                           [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'"></div>
                    }
                  </label>

                  <label class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors"
                      [class.bg-slate-800]="tempQualityPreset() === 'low'" [class.border-emerald-500]="tempUiMode() !== 'enhanced' && tempQualityPreset() === 'low'" [class.border-amber-500]="tempUiMode() === 'enhanced' && tempQualityPreset() === 'low'"
                      [class.bg-slate-850/40]="tempQualityPreset() !== 'low'" [class.border-slate-800/70]="tempQualityPreset() !== 'low'"
                      [class.hover:border-slate-700]="tempQualityPreset() !== 'low'">
                    <div>
                       <div class="font-medium text-slate-200 border-none select-none"
                            [class.text-base]="tempUiMode() === 'enhanced'" [class.text-sm]="tempUiMode() !== 'enhanced'" [class.font-semibold]="tempUiMode() === 'enhanced'">Thấp</div>
                      <div class="mt-1"
                           [class.text-sm]="tempUiMode() === 'enhanced'" [class.text-slate-300]="tempUiMode() === 'enhanced'"
                           [class.text-xs]="tempUiMode() !== 'enhanced'" [class.text-slate-400]="tempUiMode() !== 'enhanced'">Video: 2 Mbps, Audio: 128 kbps</div>
                    </div>
                    <input type="radio" name="quality" value="low" [checked]="tempQualityPreset() === 'low'" (change)="setQualityPreset('low')" class="hidden">
                    @if (tempQualityPreset() === 'low') {
                      <div class="rounded-full border-slate-900"
                           [class.bg-emerald-500]="tempUiMode() !== 'enhanced'" [class.shadow-[0_0_0_1px_rgba(16,185,129,1)]]="tempUiMode() !== 'enhanced'"
                           [class.bg-amber-500]="tempUiMode() === 'enhanced'" [class.shadow-[0_0_0_1px_rgba(245,158,11,1)]]="tempUiMode() === 'enhanced'"
                           [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'" [class.border-[4px]]="tempUiMode() === 'enhanced'"
                           [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'" [class.border-[3px]]="tempUiMode() !== 'enhanced'"></div>
                    } @else {
                      <div class="rounded-full border border-slate-600 shrink-0 select-none"
                           [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'"
                           [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'"></div>
                    }
                  </label>
                </div>
              </div>

              <!-- Right Column: Interface & Camera Size -->
              <div class="space-y-4">
                <!-- Interface Mode Option Card -->
                <div class="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 md:p-5 space-y-3.5 shadow-inner">
                  <h3 class="font-medium text-slate-200 select-none pb-2 border-b border-slate-800/50 flex items-center gap-2"
                      [class.text-base]="tempUiMode() === 'enhanced'" [class.font-semibold]="tempUiMode() === 'enhanced'"
                      [class.text-sm]="tempUiMode() !== 'enhanced'">
                    <span class="w-1.5 h-1.5 rounded-full animate-[pulse_2s_infinite]"
                          [class.bg-emerald-500]="tempUiMode() !== 'enhanced'"
                          [class.bg-amber-500]="tempUiMode() === 'enhanced'"></span>
                    Chế độ giao diện
                  </h3>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors"
                        [class.bg-slate-800]="tempUiMode() === 'default'" [class.border-emerald-500]="tempUiMode() === 'default'"
                        [class.bg-slate-850/40]="tempUiMode() !== 'default'" [class.border-slate-800/70]="tempUiMode() !== 'default'"
                        [class.hover:border-slate-600]="tempUiMode() !== 'default'">
                      <div>
                        <div class="font-medium text-slate-200 select-none"
                             [class.text-base]="tempUiMode() === 'enhanced'"
                             [class.text-sm]="tempUiMode() !== 'enhanced'">Mặc định</div>
                      </div>
                      <input type="radio" name="uiMode" value="default" [checked]="tempUiMode() === 'default'" (change)="setUiMode('default')" class="hidden">
                      @if (tempUiMode() === 'default') {
                        <div class="rounded-full border-slate-900"
                             [class.bg-emerald-500]="tempUiMode() !== 'enhanced'" [class.shadow-[0_0_0_1px_rgba(16,185,129,1)]]="tempUiMode() !== 'enhanced'"
                             [class.bg-amber-500]="tempUiMode() === 'enhanced'" [class.shadow-[0_0_0_1px_rgba(245,158,11,1)]]="tempUiMode() === 'enhanced'"
                             [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'" [class.border-[4px]]="tempUiMode() === 'enhanced'"
                             [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'" [class.border-[3px]]="tempUiMode() !== 'enhanced'"></div>
                      } @else {
                        <div class="rounded-full border border-slate-600 col-span-1 shrink-0 select-none"
                             [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'"
                             [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'"></div>
                      }
                    </label>

                    <label class="group relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors"
                        [class.bg-slate-800]="tempUiMode() === 'enhanced'" [class.border-amber-500]="tempUiMode() === 'enhanced'"
                        [class.bg-slate-850/40]="tempUiMode() !== 'enhanced'" [class.border-slate-800/70]="tempUiMode() !== 'enhanced'"
                        [class.hover:border-slate-600]="tempUiMode() !== 'enhanced'">
                      
                      <!-- Elegant Tailwind Tooltip -->
                      <div class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 text-center scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 z-50 bg-slate-950/95 border border-slate-700/50 px-2.5 py-1.5 text-[11px] leading-normal text-slate-200 rounded-lg shadow-xl backdrop-blur-md selection:bg-transparent">
                        Dành cho người cao tuổi hoặc gặp vấn đề về thị lực.
                        <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950/95"></div>
                      </div>

                      <div>
                        <div class="font-medium text-slate-200 select-none flex items-center gap-1.5"
                             [class.text-base]="tempUiMode() === 'enhanced'"
                             [class.text-sm]="tempUiMode() !== 'enhanced'">
                          <span>Tăng cường</span>
                        </div>
                      </div>
                      <input type="radio" name="uiMode" value="enhanced" [checked]="tempUiMode() === 'enhanced'" (change)="setUiMode('enhanced')" class="hidden">
                      @if (tempUiMode() === 'enhanced') {
                        <div class="rounded-full border-slate-900"
                             [class.bg-emerald-500]="tempUiMode() !== 'enhanced'" [class.shadow-[0_0_0_1px_rgba(16,185,129,1)]]="tempUiMode() !== 'enhanced'"
                             [class.bg-amber-500]="tempUiMode() === 'enhanced'" [class.shadow-[0_0_0_1px_rgba(245,158,11,1)]]="tempUiMode() === 'enhanced'"
                             [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'" [class.border-[4px]]="tempUiMode() === 'enhanced'"
                             [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'" [class.border-[3px]]="tempUiMode() !== 'enhanced'"></div>
                      } @else {
                        <div class="rounded-full border border-slate-600 col-span-1 shrink-0 select-none"
                             [class.w-5]="tempUiMode() === 'enhanced'" [class.h-5]="tempUiMode() === 'enhanced'"
                             [class.w-4]="tempUiMode() !== 'enhanced'" [class.h-4]="tempUiMode() !== 'enhanced'"></div>
                      }
                    </label>
                  </div>
                </div>
                
                <!-- Camera Size Card -->
                <div class="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 md:p-5 space-y-3.5 shadow-inner">
                  <h3 class="font-medium text-slate-200 mb-1 select-none pb-2 border-b border-slate-800/50 flex items-center gap-2"
                      [class.text-base]="tempUiMode() === 'enhanced'" [class.font-semibold]="tempUiMode() === 'enhanced'"
                      [class.text-sm]="tempUiMode() !== 'enhanced'">
                    <span class="w-1.5 h-1.5 rounded-full animate-[pulse_2s_infinite]"
                          [class.bg-emerald-500]="tempUiMode() !== 'enhanced'"
                          [class.bg-amber-500]="tempUiMode() === 'enhanced'"></span>
                    Kích cỡ Video (Webcam)
                  </h3>
                  <div class="flex items-center gap-4 pt-1">
                    <span class="font-mono w-12 text-slate-400"
                          [class.text-sm]="tempUiMode() === 'enhanced'" [class.text-slate-300]="tempUiMode() === 'enhanced'"
                          [class.text-xs]="tempUiMode() !== 'enhanced'">120px</span>
                    <input 
                       type="range" 
                       min="120" 
                       max="360" 
                       step="5"
                       [value]="tempCameraSize()" 
                       (input)="updateCameraSize($event)"
                       class="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2"
                       [class.accent-emerald-500]="tempUiMode() !== 'enhanced'" [class.focus:ring-emerald-500/50]="tempUiMode() !== 'enhanced'"
                       [class.accent-amber-500]="tempUiMode() === 'enhanced'" [class.focus:ring-amber-500/50]="tempUiMode() === 'enhanced'"
                    >
                    <span class="font-mono w-12 text-right text-slate-400"
                          [class.text-sm]="tempUiMode() === 'enhanced'" [class.text-slate-300]="tempUiMode() === 'enhanced'"
                          [class.text-xs]="tempUiMode() !== 'enhanced'">360px</span>
                  </div>
                  <div class="text-center mt-1 font-mono font-bold"
                       [class.text-emerald-400]="tempUiMode() !== 'enhanced'"
                       [class.text-amber-400]="tempUiMode() === 'enhanced'"
                       [class.text-base]="tempUiMode() === 'enhanced'"
                       [class.text-xs]="tempUiMode() !== 'enhanced'">{{ tempCameraSize() }}px</div>
                </div>
              </div>

            </div>
          </div>
          
          <!-- Footer / Action Buttons -->
          <div class="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex gap-3">
            <button (click)="resetSettings.emit()" class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700/50"
                    [class.text-base]="tempUiMode() === 'enhanced'"
                    [class.text-sm]="tempUiMode() !== 'enhanced'">
              Về mặc định
            </button>
            <button (click)="saveSettings.emit()" class="flex-1 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    [class.bg-emerald-600]="tempUiMode() !== 'enhanced'" [class.hover:bg-emerald-500]="tempUiMode() !== 'enhanced'"
                    [class.bg-amber-600]="tempUiMode() === 'enhanced'" [class.hover:bg-amber-500]="tempUiMode() === 'enhanced'"
                    [class.text-base]="tempUiMode() === 'enhanced'"
                    [class.text-sm]="tempUiMode() !== 'enhanced'">
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class SettingsModal {
  show = model(false);
  tempQualityPreset = model<'high' | 'medium' | 'low'>('medium');
  tempCameraSize = model<number>(120);
  tempUiMode = model<'default' | 'enhanced'>('default');

  saveSettings = output<void>();
  resetSettings = output<void>();

  setQualityPreset(preset: 'high' | 'medium' | 'low') {
    this.tempQualityPreset.set(preset);
  }

  setUiMode(mode: 'default' | 'enhanced') {
    this.tempUiMode.set(mode);
  }

  updateCameraSize(event: Event) {
    const input = event.target as HTMLInputElement;
    this.tempCameraSize.set(Number(input.value));
  }
}
