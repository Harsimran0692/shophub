import { Injectable } from '@angular/core';

interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: Toast[] = [];

  show(
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration = 3000
  ) {
    const id = Date.now();
    const toast: Toast = {
      id: id,
      title: title,
      message: message,
      type: type,
    };
    this.toasts.push(toast);

    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  success(message: string, title = 'Success') {
    this.show(title, message, 'success');
  }

  error(message: string, title = 'Error') {
    this.show(title, message, 'error');
  }

  info(message: string, title = 'Info') {
    this.show(title, message, 'info');
  }
}
