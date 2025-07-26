import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  signal,
  computed,
  HostListener,
  ElementRef,
  Input // Make sure Input is imported!
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; // For ngModel

// Interfaces (re-imported or globally available if moved to shared types file)
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

interface Breadcrumb {
  label: string;
  route?: string;
}

interface SearchResult {
  id: string;
  name: string;
  type: 'driver' | 'vehicle' | 'incident';
  route: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  // CORRECTED: This input now expects a boolean, not a signal
  @Input() isMobileMenuOpen: boolean = false;
  @Input() isSidebarCollapsed: boolean = false;

  currentUser = signal<User>({
    id: 'user123',
    name: 'Officer John Mukamuri',
    email: 'john.mukamuri@rsa.gov',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=John&backgroundColor=b6e3f4,c0aede,d1d4f9',
    role: 'officer',
    permissions: [
      'view_dashboard',
      'view_live_monitoring',
      'manage_incidents',
      'view_violations',
      'manage_drivers',
      'view_analytics',
      'manage_users',
      'system_config',
    ],
  });

  notifications = signal<Notification[]>([
    {
      id: 'notif1',
      type: 'violation',
      title: 'New Speed Violation',
      message: 'Vehicle ABC-123 detected speeding on Samora Machel Ave.',
      timestamp: new Date(Date.now() - 60 * 1000 * 5), // 5 mins ago
      read: false,
      priority: 'high',
    },
    {
      id: 'notif2',
      type: 'incident',
      title: 'Accident Reported',
      message: 'Minor collision at Borrowdale Road & Harare Drive intersection.',
      timestamp: new Date(Date.now() - 60 * 1000 * 30), // 30 mins ago
      read: false,
      priority: 'critical',
    },
    {
      id: 'notif3',
      type: 'system',
      title: 'System Update',
      message: 'Scheduled maintenance for tonight at 11 PM.',
      timestamp: new Date(Date.now() - 60 * 1000 * 60 * 2), // 2 hours ago
      read: false,
      priority: 'low',
    },
    {
      id: 'notif4',
      type: 'violation',
      title: 'Red Light Violation',
      message: 'Truck XYZ-789 ran a red light at Julius Nyerere Way.',
      timestamp: new Date(Date.now() - 60 * 1000 * 60 * 4), // 4 hours ago
      read: false,
      priority: 'high',
    },
    {
      id: 'notif5',
      type: 'system',
      title: 'Disk Space Low',
      message: 'Server storage is running low, please investigate.',
      timestamp: new Date(Date.now() - 60 * 1000 * 60 * 24), // 1 day ago
      read: true,
      priority: 'medium',
    },
  ]);

  unreadNotificationCount = computed(
    () => this.notifications().filter((n) => !n.read).length,
  );

  showUserDropdown = signal(false);
  showNotificationsDropdown = signal(false);
  searchQuery = signal('');
  searchResults = signal<SearchResult[]>([]);
  breadcrumbs = signal<Breadcrumb[]>([]);

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private elementRef: ElementRef,
  ) {}

  ngOnInit(): void {
    // Listen to router events for breadcrumb generation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.breadcrumbs.set(this.createBreadcrumbs(this.activatedRoute.root));
        this.closeAllDropdowns(); // Close dropdowns on route change
      }
    });
  }

  // Click outside listener to close dropdowns
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
    }
  }

  toggleUserDropdown(): void {
    this.showUserDropdown.update((val) => !val);
    if (this.showUserDropdown()) {
      this.showNotificationsDropdown.set(false); // Close others
    }
  }

  toggleNotifications(): void {
    this.showNotificationsDropdown.update((val) => !val);
    if (this.showNotificationsDropdown()) {
      this.showUserDropdown.set(false); // Close others
    }
  }

  closeAllDropdowns(): void {
    this.showUserDropdown.set(false);
    this.showNotificationsDropdown.set(false);
  }

  logout(): void {
    console.log('User logged out.');
    // Implement actual logout logic (e.g., clear tokens, redirect to login)
    this.router.navigate(['/login']);
    this.closeAllDropdowns();
  }

  markNotificationRead(id: string): void {
    this.notifications.update((notifs) =>
      notifs.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  markAllNotificationsRead(): void {
    this.notifications.update((notifs) => notifs.map((n) => ({ ...n, read: true })));
  }

  viewNotification(notification: Notification): void {
    console.log('Viewing notification:', notification);
    this.markNotificationRead(notification.id);
    // Optionally navigate to a detailed view based on notification type
    // e.g., if (notification.type === 'violation') this.router.navigate(['/violations', notification.id]);
    this.closeAllDropdowns();
  }

  onSearchInput(): void {
    const query = this.searchQuery().toLowerCase();
    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }
    // Mock search results
    const mockData: SearchResult[] = [
      { id: 'd1', name: 'John Doe', type: 'driver', route: '/drivers/1' },
      { id: 'v1', name: 'Toyota Corolla XYZ-789', type: 'vehicle', route: '/vehicles/1' },
      { id: 'i1', name: 'Incident #00123', type: 'incident', route: '/incidents/123' },
      { id: 'd2', name: 'Jane Smith', type: 'driver', route: '/drivers/2' },
      { id: 'v2', name: 'Ford Ranger ABC-123', type: 'vehicle', route: '/vehicles/2' },
    ];
    this.searchResults.set(
      mockData.filter(
        (item) => item.name.toLowerCase().includes(query) || item.id.includes(query),
      ),
    );
  }

  selectSearchResult(result: SearchResult): void {
    this.router.navigateByUrl(result.route);
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  // Breadcrumb Generation Logic
  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = [],
  ): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      if (child.outlet !== 'primary') {
        continue;
      }

      // Check if the route has a 'breadcrumb' data property
      const routeData = child.snapshot.data;
      if (routeData && routeData['breadcrumb']) {
        const routeURL = child.snapshot.url.map((segment) => segment.path).join('/');
        const currentUrlSegment = url ? `${url}/${routeURL}` : `/${routeURL}`; // Build URL path correctly
        breadcrumbs.push({ label: routeData['breadcrumb'], route: currentUrlSegment });
        url = currentUrlSegment; // Update url for next iteration
      } else if (child.snapshot.url.length > 0) {
        // Fallback for routes without specific breadcrumb data
        const routeURL = child.snapshot.url.map((segment) => segment.path).join('/');
        const currentUrlSegment = url ? `${url}/${routeURL}` : `/${routeURL}`;
        let label = routeURL.replace(/-/g, ' '); // Basic label generation
        if (label.includes('/')) {
          label = label.substring(label.lastIndexOf('/') + 1);
        }
        breadcrumbs.push({ label: this.capitalizeWords(label), route: currentUrlSegment });
        url = currentUrlSegment; // Update url for next iteration
      }

      // Recursively call for children
      const result = this.createBreadcrumbs(child, url, breadcrumbs);
      // If result contains new breadcrumbs, it means a deeper path was found, return it
      if (result.length > breadcrumbs.length) {
          return result;
      }
    }
    return breadcrumbs;
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
