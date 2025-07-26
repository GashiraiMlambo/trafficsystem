import { Component, OnInit, signal, HostListener, computed, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, NgClass, isPlatformBrowser } from '@angular/common'; // Import isPlatformBrowser
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/header/header/header.component';
import { SidebarComponent } from './core/header/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

// Interfaces (re-imported for clarity, ideally in a shared types file)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'officer' | 'dispatcher' | 'driver';
  permissions: string[];
}

export interface Notification {
  id: string;
  type: 'violation' | 'incident' | 'system' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  roles: string[];
  badge?: number;
}

// Simple Toast Service (can be extracted to a proper service)
class ToastService {
  private _toasts = signal<Notification[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(
    type: 'info' | 'success' | 'warning' | 'error',
    title: string,
    message: string,
    duration: number = 5000,
  ) {
    const newToast: Notification = {
      id: Date.now().toString(),
      type: type,
      title: title,
      message: message,
      timestamp: new Date(),
      read: false,
      priority: 'low', // Default priority for toast
    };
    this._toasts.update((toasts) => [...toasts, newToast]);

    if (duration > 0) {
      setTimeout(() => this.remove(newToast.id), duration);
    }
  }

  remove(id: string) {
    this._toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, NgClass, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isSidebarCollapsed = signal<boolean>(false);
  isMobileSidebarOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false); // Global loading state
  toastService = new ToastService(); // Instance of ToastService
  toasts = this.toastService.toasts; // Expose toasts signal

  private isBrowser: boolean;

  // Determine if it's a mobile device - guarded by isPlatformBrowser
  isMobile = computed(() => this.isBrowser && window.innerWidth < 768);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Only perform browser-specific checks if running in the browser
    if (this.isBrowser) {
      this.checkMobileAndSetSidebar();

      // Example: Simulate loading and show a toast
      this.isLoading.set(true);
      setTimeout(() => {
        this.isLoading.set(false);
        this.toastService.show(
          'success',
          'Welcome!',
          'Road Safety Management System is ready.',
        );
      }, 1500);
    } else {
      // For SSR, ensure loading is false and sidebar is collapsed by default
      this.isLoading.set(false);
      this.isSidebarCollapsed.set(true);
    }
  }

  // Only add HostListener if in browser environment
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (this.isBrowser) {
      this.checkMobileAndSetSidebar();
    }
  }

  private checkMobileAndSetSidebar(): void {
    if (this.isBrowser) { // Guard localStorage access
      if (this.isMobile()) {
        this.isSidebarCollapsed.set(true); // Always collapsed on mobile by default
        this.isMobileSidebarOpen.set(false); // Start closed
      } else {
        // On desktop, restore last state or default to expanded
        const storedState = localStorage.getItem('sidebarCollapsed');
        this.isSidebarCollapsed.set(storedState === 'true');
        this.isMobileSidebarOpen.set(false); // Ensure it's closed on desktop
      }
    }
  }

  toggleSidebar(): void {
    if (this.isBrowser) { // Guard localStorage access
      if (this.isMobile()) {
        this.isMobileSidebarOpen.update((val) => !val);
      } else {
        this.isSidebarCollapsed.update((val) => {
          localStorage.setItem('sidebarCollapsed', String(!val));
          return !val;
        });
      }
    }
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  // Example of how to trigger a toast from another component/service
  showTestToast(): void {
    this.toastService.show(
      'info',
      'New Alert',
      'A new incident has been reported on Mukuvisi bridge.',
      8000,
    );
  }
}
