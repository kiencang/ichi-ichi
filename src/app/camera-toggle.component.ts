import { Component, input, output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-camera-toggle',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="flex flex-col items-center space-y-3 pointer-events-none select-none w-full animate-none">
      <!-- Camera Toggle -->
      <div 
         class="group flex items-center gap-3 backdrop-blur-md border pl-4 pr-3 py-2 rounded-full pointer-events-auto transition-all duration-300 shadow-lg"
         [class.bg-slate-900/60]="uiMode() !== 'enhanced'"
         [class.hover:bg-slate-800/80]="uiMode() !== 'enhanced'"
         [class.bg-slate-900]="uiMode() === 'enhanced'"
         [class.hover:bg-slate-800]="uiMode() === 'enhanced'"
         [class.border-slate-700/50]="!isCameraEnabled()"
         [class.border-teal-500/30]="uiMode() !== 'enhanced' && isCameraEnabled()"
         [class.border-amber-500/50]="uiMode() === 'enhanced' && isCameraEnabled()"
         [class.opacity-40]="cameraError() !== null"
         [attr.title]="cameraError()"
       >
        <div class="flex items-center gap-2">
            <!-- Status Dot -->
            <div class="relative flex" [class.h-2]="uiMode() !== 'enhanced'" [class.w-2]="uiMode() !== 'enhanced'" [class.h-3]="uiMode() === 'enhanced'" [class.w-3]="uiMode() === 'enhanced'">
              @if (isCameraEnabled()) {
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" [class.bg-teal-400]="uiMode() !== 'enhanced'" [class.bg-amber-400]="uiMode() === 'enhanced'"></span>
                <span class="relative inline-flex rounded-full h-full w-full" [class.bg-teal-500]="uiMode() !== 'enhanced'" [class.bg-amber-500]="uiMode() === 'enhanced'"></span>
              } @else {
                <span class="relative inline-flex rounded-full h-full w-full bg-slate-600"></span>
              }
            </div>
            
            <!-- Label -->
            <span class="font-mono tracking-widest uppercase pt-0.5 transition-colors duration-300" 
               [class.text-xs]="uiMode() !== 'enhanced'" 
               [class.font-medium]="uiMode() !== 'enhanced'"
               [class.text-sm]="uiMode() === 'enhanced'" 
               [class.font-bold]="uiMode() === 'enhanced'" 
               [class.text-teal-400]="uiMode() !== 'enhanced' && isCameraEnabled()" 
               [class.text-amber-400]="uiMode() === 'enhanced' && isCameraEnabled()" 
               [class.text-slate-400]="uiMode() !== 'enhanced' && !isCameraEnabled()"
               [class.text-slate-300]="uiMode() === 'enhanced' && !isCameraEnabled()"
             >
              {{ lang.translations().CAMERA }}
            </span>
        </div>
        
        <!-- Divider -->
        <div class="w-px h-4 bg-slate-700/60 mx-1"></div>

        <button 
          (click)="toggleCamera.emit()"
          [disabled]="isRecording() || isCountingDown()"
          class="relative inline-flex items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer p-[2px]"
          [class.h-5]="uiMode() !== 'enhanced'" [class.w-9]="uiMode() !== 'enhanced'"
          [class.h-6]="uiMode() === 'enhanced'" [class.w-11]="uiMode() === 'enhanced'"
          [class.bg-teal-500/80]="uiMode() !== 'enhanced' && isCameraEnabled()"
          [class.bg-amber-500]="uiMode() === 'enhanced' && isCameraEnabled()"
          [class.bg-slate-700]="!isCameraEnabled()"
        >
          <span 
            class="inline-block transform rounded-full bg-white transition-transform ease-in-out shadow-sm"
            [class.h-4]="uiMode() !== 'enhanced'" [class.w-4]="uiMode() !== 'enhanced'"
            [class.h-5]="uiMode() === 'enhanced'" [class.w-5]="uiMode() === 'enhanced'"
            [class.translate-x-4]="uiMode() !== 'enhanced' && isCameraEnabled()"
            [class.translate-x-0]="uiMode() !== 'enhanced' && !isCameraEnabled()"
            [class.translate-x-5]="uiMode() === 'enhanced' && isCameraEnabled()"
            [class.translate-x-0]="uiMode() === 'enhanced' && !isCameraEnabled()"
          ></span>
        </button>
      </div>

      @if (recordingAttempted() && (!hasMicDevice() || micPermission() === 'denied')) {
        <div class="flex flex-wrap items-center justify-center gap-2 mt-2 pointer-events-auto select-none">
         <div [class]="uiMode() === 'enhanced'
           ? 'flex items-center space-x-1.5 text-orange-400 bg-orange-500/10 rounded-full font-bold border border-orange-500/20 px-4 py-2.5 text-sm transition-all duration-300 shadow-sm'
           : 'flex items-center space-x-1.5 text-orange-400 bg-orange-500/10 rounded-full font-medium border border-orange-500/20 px-3 py-1.5 text-xs transition-all duration-300'"
         >
           <mat-icon class="!text-[16px] !w-[16px] !h-[16px]">warning</mat-icon>
           <span>{{ lang.translations().MIC_UNAVAILABLE }}</span>
         </div>
        </div>
      }

      @if (cameraError()) {
        <div class="flex flex-wrap items-center justify-center gap-2 mt-2 pointer-events-auto select-none">
         <div [class]="uiMode() === 'enhanced'
           ? 'flex items-center space-x-1.5 text-rose-400 bg-rose-500/10 rounded-full font-bold border border-rose-500/20 px-4 py-2.5 text-sm transition-all duration-300 shadow-sm'
           : 'flex items-center space-x-1.5 text-rose-400 bg-rose-500/10 rounded-full font-medium border border-rose-500/20 px-3 py-1.5 text-xs transition-all duration-300'"
         >
           <mat-icon class="text-rose-400 !text-[16px] !w-[16px] !h-[16px]">warning</mat-icon>
           <span>{{ cameraError() }}</span>
         </div>
        </div>
      }
     </div>
  `
})
export class CameraToggleComponent {
  uiMode = input.required<'default' | 'enhanced'>();
  isCameraEnabled = input.required<boolean>();
  isRecording = input.required<boolean>();
  isCountingDown = input.required<boolean>();
  cameraError = input<string | null>(null);
  hasMicDevice = input<boolean | null>(true);
  micPermission = input<string | null>('granted');
  recordingAttempted = input.required<boolean>();
  
  toggleCamera = output<void>();

  lang = inject(LanguageService);
}
