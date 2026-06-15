import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
    show = signal(false);
    message = signal('');

    success(msg: string) {
        this.message.set(msg);
        this.show.set(true);
        setTimeout(() => this.show.set(false), 5000);
    }
}
