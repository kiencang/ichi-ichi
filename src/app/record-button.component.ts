import { Component, input, output, inject } from '@angular/core';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-record-button',
  standalone: true,
  template: `
    <button 
      (click)="toggleRecord.emit()"
      class="group relative flex items-center justify-center w-36 h-36 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50 cursor-pointer"
      [attr.title]="isRecording() ? lang.translations().STOP_RECORDING_TITLE : lang.translations().START_RECORDING_TITLE"
    >
      <!-- Old / Worn out Outer Background -->
      <div 
        class="absolute inset-0 rounded-full transition-all duration-500 pointer-events-none overflow-hidden"
        [class.bg-gradient-to-br]="!isRecording()" [class.from-[#be123c]]="!isRecording()" [class.to-[#880d28]]="!isRecording()"
        [class.group-hover:from-[#9f0f32]]="!isRecording()" [class.group-hover:to-[#720b22]]="!isRecording()"
        [class.shadow-[inset_0_4px_10px_rgba(0,0,0,0.7),inset_0_-2px_6px_rgba(255,255,255,0.1),0_15px_30px_rgba(0,0,0,0.5)]]="!isRecording()"
        [class.scale-100]="!isRecording()"
        [class.group-hover:scale-[1.02]]="!isRecording()"
        [class.bg-transparent]="isRecording()"
      >
        @if (!isRecording()) {
          <!-- Faded wear ring -->
          <div class="absolute inset-0 rounded-full border-[4px] border-[#f43f5e]/10 mix-blend-overlay"></div>
          <!-- Dark dirt inset -->
          <div class="absolute inset-2 rounded-full border-2 border-black/40 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"></div>
          <!-- Radial fade for worn center pressed area -->
          <div class="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_20%,rgba(0,0,0,0.5)_90%)] mix-blend-hard-light"></div>
          <!-- Scrape / light reflection marks -->
          <div class="absolute -top-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-md transform rotate-45"></div>
        }
      </div>

      <!-- Pulsing rings when recording -->
      @if (isRecording()) {
        <span class="absolute inset-0 rounded-full border-[3px] border-[#BE123C] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-60"></span>
        <span class="absolute inset-4 rounded-full border-[3px] border-[#BE123C] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_1s_infinite] opacity-40"></span>
        <span class="absolute inset-0 rounded-full border-[8px] border-[#880d28] shadow-[inset_0_4px_10px_rgba(0,0,0,0.7),0_0_24px_rgba(225,29,72,0.6)]"></span>
      }

      <!-- Cinematic Lens Bezel Engraving -->
      @if (!isRecording()) {
        <svg viewBox="0 0 100 100" class="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-50 mix-blend-overlay drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] transition-all duration-300 transform group-hover:rotate-12 group-hover:opacity-70">
          <path id="bezel-path" d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
          <text font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" font-size="4.5" font-weight="600" fill="#ffffff" letter-spacing="0.25em" class="uppercase">
            <textPath href="#bezel-path" startOffset="10%" text-anchor="middle">ICHI ICHI</textPath>
          </text>
        </svg>
      }

      <!-- Center Icon/Shape (also worn) -->
      <div 
        class="relative z-10 transition-all duration-500 pointer-events-none flex items-center justify-center overflow-hidden w-full h-full"
        [class.scale-100]="!isRecording()"
        [class.group-hover:scale-95]="!isRecording()"
      >
         <div 
           class="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform relative flex items-center justify-center overflow-hidden"
           [class.bg-[#e2e8f0]]="!isRecording()"
           [class.w-12]="!isRecording()"
           [class.h-12]="!isRecording()"
           [class.rounded-full]="!isRecording()"
           [class.shadow-[inset_0_3px_5px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(255,255,255,0.6),0_4px_10px_rgba(0,0,0,0.6)]]="!isRecording()"
           [class.bg-gradient-to-br]="isRecording()" [class.from-[#be123c]]="isRecording()" [class.to-[#880d28]]="isRecording()"
           [class.w-[52px]]="isRecording()"
           [class.h-[52px]]="isRecording()"
           [class.rounded-xl]="isRecording()"
           [class.scale-95]="isRecording()"
           [class.shadow-[inset_0_3px_8px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.5)]]="isRecording()"
         >
           @if (!isRecording()) {
             <!-- Dirt/wear on the white button -->
             <div class="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05)_40%,rgba(0,0,0,0.25)_100%)]"></div>
             <div class="absolute top-1 left-2 w-4 h-3 bg-white/60 blur-[1px] rounded-full rotate-[-30deg]"></div>
           }
         </div>
      </div>
    </button>
  `
})
export class RecordButtonComponent {
  isRecording = input.required<boolean>();
  toggleRecord = output<void>();

  lang = inject(LanguageService);
}
