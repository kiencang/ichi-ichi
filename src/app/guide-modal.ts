import { ChangeDetectionStrategy, Component, model, input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-guide-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (show()) {
      <div (click)="$event.target === $event.currentTarget && show.set(false)" class="fixed inset-0 z-[110] flex items-center justify-center bg-[#070b14]/85 backdrop-blur-sm transition-all p-4 cursor-pointer">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-[716px] overflow-hidden flex flex-col max-h-[90vh] cursor-default"
             [class.max-w-[760px]]="uiMode() === 'enhanced'">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/50">
            <h2 class="text-slate-200 font-medium flex flex-wrap items-center gap-2"
                [class.text-xl]="uiMode() === 'enhanced'" [class.font-bold]="uiMode() === 'enhanced'"
                [class.text-lg]="uiMode() !== 'enhanced'">
              <mat-icon class="w-5 h-5 text-slate-400 shrink-0">help_outline</mat-icon>
              <span>{{ lang.translations().USER_GUIDE }} 
                <span class="font-normal inline-block ml-1 text-left"
                      [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-300]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  {{ lang.translations().GUIDE_BEST_COMPATIBILITY }}
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
              <div class="p-4 rounded-xl bg-emerald-500/5 border border-emerald-505/10 flex gap-3 items-start"
                   [class.bg-emerald-500/10]="uiMode() === 'enhanced'" [class.border-emerald-500/30]="uiMode() === 'enhanced'">
                <mat-icon class="!text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] shrink-0 mt-0.5 !text-[20px] !w-[20px] !h-[20px]"
                     [class.!text-[24px]]="uiMode() === 'enhanced'" [class.!w-[24px]]="uiMode() === 'enhanced'" [class.!h-[24px]]="uiMode() === 'enhanced'">verified_user</mat-icon>
                <div class="space-y-1 text-left">
                  <h4 class="font-bold text-emerald-400 uppercase tracking-wider"
                      [class.text-sm]="uiMode() === 'enhanced'"
                      [class.text-xs]="uiMode() !== 'enhanced'">{{ lang.translations().GUIDE_PRIVACY_TITLE }}</h4>
                  <p class="leading-relaxed font-sans"
                     [class.text-sm]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                     [class.text-xs]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                    {{ lang.translations().GUIDE_PRIVACY_BODY }}
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
                  <h3 class="text-slate-300 font-medium text-left"
                      [class.text-lg]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-base]="uiMode() !== 'enhanced'">{{ lang.translations().GUIDE_STEP_1 }}</h3>
                </div>
                <p class="pl-10 leading-relaxed text-left"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  {{ lang.translations().GUIDE_STEP_1_BODY }}
                </p>
                <div class="pl-10">
                  <div class="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/30">
                    <img src="cap-quyen-2.png" [attr.alt]="lang.translations().GUIDE_STEP_1_ALT1" class="w-full h-auto" referrerpolicy="no-referrer" />
                  </div>
                </div>
                <p class="pl-10 leading-relaxed text-left"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  {{ lang.translations().GUIDE_STEP_1_TIPS }}
                </p>
                <div class="pl-10">
                  <div class="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/30">
                    <img src="cap-quyen-3.png" [attr.alt]="lang.translations().GUIDE_STEP_1_ALT2" class="w-full h-auto" referrerpolicy="no-referrer" />
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
                  <h3 class="text-slate-300 font-medium text-left"
                      [class.text-lg]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-base]="uiMode() !== 'enhanced'">{{ lang.translations().GUIDE_STEP_2 }}</h3>
                </div>
                <p class="pl-10 leading-relaxed text-left"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  {{ lang.translations().GUIDE_STEP_2_BODY }}
                </p>
                <div class="pl-10">
                  <div class="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-800/30">
                    <img src="cap-quyen-1.png" [attr.alt]="lang.translations().GUIDE_STEP_2_ALT1" class="w-full h-auto" referrerpolicy="no-referrer" />
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
                  <h3 class="text-slate-300 font-medium text-left"
                      [class.text-lg]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-base]="uiMode() !== 'enhanced'">{{ lang.translations().GUIDE_STEP_3 }}</h3>
                </div>
                <p class="pl-10 leading-relaxed text-left"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  {{ lang.translations().GUIDE_STEP_3_BODY }}
                </p>
              </div>

              <hr class="border-slate-800/60 ml-10">

              <!-- Step 4 -->
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span class="flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shrink-0"
                        [class.w-9]="uiMode() === 'enhanced'" [class.h-9]="uiMode() === 'enhanced'" [class.text-base]="uiMode() === 'enhanced'"
                        [class.w-7]="uiMode() !== 'enhanced'" [class.h-7]="uiMode() !== 'enhanced'" [class.text-sm]="uiMode() !== 'enhanced'">4</span>
                  <h3 class="text-slate-300 font-medium text-left"
                      [class.text-lg]="uiMode() === 'enhanced'" [class.font-semibold]="uiMode() === 'enhanced'"
                      [class.text-base]="uiMode() !== 'enhanced'">{{ lang.translations().GUIDE_STEP_4 }}</h3>
                </div>
                <p class="pl-10 leading-relaxed text-left"
                   [class.text-base]="uiMode() === 'enhanced'" [class.text-slate-200]="uiMode() === 'enhanced'"
                   [class.text-sm]="uiMode() !== 'enhanced'" [class.text-slate-400]="uiMode() !== 'enhanced'">
                  {{ lang.translations().GUIDE_STEP_4_BODY }}
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

  lang = inject(LanguageService);
}
