import { Component, input, output, inject } from '@angular/core';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-countdown-overlay',
  standalone: true,
  template: `
    <div class="fixed inset-0 z-[110] flex items-center justify-center bg-[#070b14]/80 backdrop-blur-sm transition-all pointer-events-auto">
       <div class="select-none flex flex-col items-center animate-none">
            <span [class.text-[180px]]="countdownValue() !== 'ACTION!'" [class.text-[70px]]="countdownValue() === 'ACTION!'" [class.sm:text-[100px]]="countdownValue() === 'ACTION!'" [class.md:text-[140px]]="countdownValue() === 'ACTION!'" class="font-mono font-bold text-white leading-none drop-shadow-2xl animate-[pulse_1s_ease-in-out_infinite]">{{ countdownValue() }}</span>
            <span class="text-slate-200 font-semibold tracking-[0.3em] mt-2 uppercase transition-all duration-300 text-center"
                  [class.text-2xl]="uiMode() === 'enhanced'"
                  [class.text-lg]="uiMode() !== 'enhanced'">
              {{ countdownValue() === 'ACTION!' ? (lang.currentLanguage() === 'vi' ? 'Hành động!' : 'Action!') : lang.translations().PREPARING_TEXT }}
            </span>
            <button (click)="cancelRecording.emit()" class="mt-12 px-8 py-3 bg-[#E11D48]/20 hover:bg-[#E11D48]/40 text-red-200 font-medium rounded-full transition-colors border border-[#E11D48]/30 shadow-lg tracking-widest uppercase cursor-pointer transition-all duration-300"
                    [class.text-base]="uiMode() === 'enhanced'" [class.font-bold]="uiMode() === 'enhanced'" [class.px-10]="uiMode() === 'enhanced'" [class.py-4]="uiMode() === 'enhanced'"
                    [class.text-sm]="uiMode() !== 'enhanced'">
              {{ lang.translations().COUNTDOWN_CANCEL }}
            </button>
       </div>
    </div>
  `
})
export class CountdownOverlayComponent {
  countdownValue = input.required<string | number>();
  uiMode = input.required<'default' | 'enhanced'>();
  cancelRecording = output<void>();

  lang = inject(LanguageService);
}
