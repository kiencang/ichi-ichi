import { Component, input, output, inject } from '@angular/core';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
  <footer class="absolute bottom-6 left-0 text-center w-full select-none">
    <p class="font-light tracking-widest uppercase flex items-center justify-center gap-2 flex-wrap transition-all duration-300"
       [class.text-slate-100]="uiMode() === 'enhanced'" [class.text-[13px]]="uiMode() === 'enhanced'" [class.font-medium]="uiMode() === 'enhanced'"
       [class.text-slate-400]="uiMode() !== 'enhanced'" [class.text-[10px]]="uiMode() !== 'enhanced'">
      <button (click)="openSettings.emit()" class="hover:text-slate-200 transition-colors font-medium text-slate-300 underline decoration-slate-500 underline-offset-4 uppercase cursor-pointer"
              [class.font-bold]="uiMode() === 'enhanced'">{{ lang.translations().SETTINGS }}</button>
      <span>&bull;</span>
      <span>ICHI ICHI &bull; {{ version() }}</span>
      <span>&bull;</span>
      <a href="https://github.com/kiencang/Ichi-Ichi" target="_blank" rel="noopener noreferrer" class="hover:text-slate-200 transition-colors cursor-pointer"
         [class.font-bold]="uiMode() === 'enhanced'">{{ lang.translations().GITHUB }}</a>
      <span>&bull;</span>
      <span>{{ lang.translations().COPYRIGHT }}</span>
      <span>&bull;</span>
      <a href="mailto:contact@wpsila.com" class="hover:text-slate-200 transition-colors cursor-pointer"
         [class.font-bold]="uiMode() === 'enhanced'">contact@wpsila.com</a>
      <span>&bull;</span>
      <button (click)="openGuide.emit()" class="hover:text-slate-200 transition-colors font-medium text-slate-300 underline decoration-slate-500 underline-offset-4 uppercase cursor-pointer"
              [class.font-bold]="uiMode() === 'enhanced'">{{ lang.translations().GUIDE_PRIVACY_TITLE }}</button>
    </p>
  </footer>
  `
})
export class FooterComponent {
  uiMode = input.required<'default' | 'enhanced'>();
  version = input.required<string>();
  openSettings = output<void>();
  openGuide = output<void>();

  lang = inject(LanguageService);
}
