import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  HostListener,
  ElementRef,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import { CommonModule, NgClass, TitleCasePipe, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';

// Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'officer' | 'supervisor' | 'dispatcher' | 'driver'; // Added supervisor, dispatcher
  permissions: string[];
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string; // Icon name string (e.g., 'home', 'bar-chart')
  route?: string;
  children?: MenuItem[];
  roles: string[];
  badge?: number; // NEW: Badge counter
  isExpanded?: boolean; // NEW: For dropdown expansion state
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgClass, TitleCasePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = signal<boolean>(false);
  @Input() isMobileOpen = signal<boolean>(false);
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() closeMobile = new EventEmitter<void>();

  currentUser = signal<User>({
    id: 'user123',
    name: 'Officer John Mukamuri',
    email: 'john.mukamuri@rsa.gov',
    role: 'officer', // Default role for testing
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=John&backgroundColor=b6e3f4,c0aede,d1d4f9',
    permissions: [
      'view_dashboard', 'view_live_monitoring', 'manage_incidents',
      'view_violations', 'manage_drivers', 'view_analytics',
      'manage_users', 'system_config',
    ],
  });

  // Comprehensive Navigation Menu Structure
  private allMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'home',
      roles: ['admin', 'officer', 'supervisor', 'dispatcher'],
      isExpanded: false,
      children: [
        { id: 'overview', label: 'Overview', icon: 'bar-chart', route: '/dashboard/overview', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'statistics', label: 'Statistics', icon: 'pie-chart', route: '/dashboard/statistics', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'metrics', label: 'Key Metrics', icon: 'target', route: '/dashboard/metrics', roles: ['admin', 'supervisor'] },
        { id: 'activity', label: 'Recent Activity', icon: 'activity', route: '/dashboard/activity', roles: ['admin', 'officer', 'supervisor'] }
      ]
    },
    {
      id: 'traffic',
      label: 'Traffic Management',
      icon: 'traffic-cone',
      roles: ['admin', 'officer', 'supervisor', 'dispatcher'],
      badge: 3, // Active incidents
      isExpanded: false,
      children: [
        { id: 'monitoring', label: 'Live Monitoring', icon: 'monitor', route: '/traffic/monitoring', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'cameras', label: 'Camera Feeds', icon: 'camera', route: '/traffic/cameras', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'incidents', label: 'Incident Reports', icon: 'alert-triangle', route: '/traffic/incidents', roles: ['admin', 'officer', 'supervisor', 'dispatcher'] },
        { id: 'conditions', label: 'Road Conditions', icon: 'road', route: '/traffic/conditions', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'ai-status', label: 'AI Detection Status', icon: 'cpu', route: '/traffic/ai-status', roles: ['admin', 'supervisor'] },
        { id: 'traffic-map', label: 'Traffic Map', icon: 'map', route: '/traffic/map', roles: ['admin', 'officer', 'supervisor', 'dispatcher'] }
      ]
    },
    {
      id: 'drivers',
      label: 'Driver Management',
      icon: 'users',
      roles: ['admin', 'officer', 'supervisor'],
      isExpanded: false,
      children: [
        { id: 'all-drivers', label: 'All Drivers', icon: 'user-check', route: '/drivers/all', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'add-driver', label: 'Add New Driver', icon: 'user-plus', route: '/drivers/add', roles: ['admin', 'officer'] },
        { id: 'safety-scores', label: 'Safety Scores', icon: 'award', route: '/drivers/scores', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'analytics', label: 'Driver Analytics', icon: 'trending-up', route: '/drivers/analytics', roles: ['admin', 'supervisor'] },
        { id: 'suspended', label: 'Suspended Drivers', icon: 'user-x', route: '/drivers/suspended', roles: ['admin', 'officer', 'supervisor'], badge: 5 },
        { id: 'verification', label: 'License Verification', icon: 'shield-check', route: '/drivers/verification', roles: ['admin', 'officer'] },
        { id: 'training', label: 'Training Records', icon: 'graduation-cap', route: '/drivers/training', roles: ['admin', 'supervisor'] }
      ]
    },
    {
      id: 'vehicles',
      label: 'Vehicle Management',
      icon: 'car',
      roles: ['admin', 'officer', 'supervisor'],
      isExpanded: false,
      children: [
        { id: 'fleet', label: 'Fleet Overview', icon: 'truck', route: '/vehicles/fleet', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'register', label: 'Register Vehicle', icon: 'plus-circle', route: '/vehicles/register', roles: ['admin', 'officer'] },
        { id: 'tracking', label: 'Vehicle Tracking', icon: 'map-pin', route: '/vehicles/tracking', roles: ['admin', 'officer', 'supervisor', 'dispatcher'] },
        { id: 'maintenance', label: 'Maintenance Schedule', icon: 'tool', route: '/vehicles/maintenance', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'insurance', label: 'Insurance Status', icon: 'shield', route: '/vehicles/insurance', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'roadworthy', label: 'Roadworthy Certificates', icon: 'file-check', route: '/vehicles/roadworthy', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'fleet-analytics', label: 'Fleet Analytics', icon: 'bar-chart-2', route: '/vehicles/analytics', roles: ['admin', 'supervisor'] }
      ]
    },
    {
      id: 'violations',
      label: 'Violations',
      icon: 'gavel',
      roles: ['admin', 'officer', 'supervisor'],
      badge: 12, // Pending reviews
      isExpanded: false,
      children: [
        { id: 'all-violations', label: 'All Violations', icon: 'list', route: '/violations/all', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'pending', label: 'Pending Reviews', icon: 'clock', route: '/violations/pending', roles: ['admin', 'officer', 'supervisor'], badge: 12 },
        { id: 'ai-detections', label: 'AI Detections', icon: 'eye', route: '/violations/ai-detections', roles: ['admin', 'officer', 'supervisor'], badge: 8 },
        { id: 'fines', label: 'Fines & Penalties', icon: 'dollar-sign', route: '/violations/fines', roles: ['admin', 'officer', 'supervisor'] },
        { id: 'appeals', label: 'Appeals', icon: 'file-text', route: '/violations/appeals', roles: ['admin', 'supervisor'] },
        { id: 'trends', label: 'Violation Trends', icon: 'trending-down', route: '/violations/trends', roles: ['admin', 'supervisor'] },
        { id: 'hotspots', label: 'Hotspot Analysis', icon: 'crosshair', route: '/violations/hotspots', roles: ['admin', 'supervisor'] }
      ]
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: 'siren',
      roles: ['admin', 'officer', 'supervisor', 'dispatcher'],
      badge: 2, // Active incidents
      isExpanded: false,
      children: [
        { id: 'active-incidents', label: 'Active Incidents', icon: 'alert-circle', route: '/emergency/active', roles: ['admin', 'officer', 'supervisor', 'dispatcher'], badge: 2 },
        { id: 'dispatch', label: 'Dispatch Center', icon: 'radio', route: '/emergency/dispatch', roles: ['admin', 'dispatcher', 'supervisor'] },
        { id: 'response-teams', label: 'Response Teams', icon: 'users', route: '/emergency/teams', roles: ['admin', 'dispatcher', 'supervisor'] },
        { id: 'medical', label: 'Medical Services', icon: 'heart', route: '/emergency/medical', roles: ['admin', 'dispatcher', 'supervisor'] },
        { id: 'police', label: 'Police Units', icon: 'shield', route: '/emergency/police', roles: ['admin', 'dispatcher', 'supervisor'] },
        { id: 'response-times', label: 'Response Times', icon: 'clock', route: '/emergency/times', roles: ['admin', 'supervisor'] },
        { id: 'history', label: 'Incident History', icon: 'archive', route: '/emergency/history', roles: ['admin', 'supervisor'] }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: 'bar-chart',
      roles: ['admin', 'supervisor'],
      isExpanded: false,
      children: [
        { id: 'traffic-patterns', label: 'Traffic Patterns', icon: 'activity', route: '/analytics/traffic-patterns', roles: ['admin', 'supervisor'] },
        { id: 'accident-analysis', label: 'Accident Analysis', icon: 'pie-chart', route: '/analytics/accidents', roles: ['admin', 'supervisor'] },
        { id: 'custom-reports', label: 'Custom Reports', icon: 'file-plus', route: '/analytics/custom', roles: ['admin', 'supervisor'] },
        { id: 'scheduled', label: 'Scheduled Reports', icon: 'calendar', route: '/analytics/scheduled', roles: ['admin', 'supervisor'] },
        { id: 'trends', label: 'Trend Analysis', icon: 'trending-up', route: '/analytics/trends', roles: ['admin', 'supervisor'] },
        { id: 'performance', label: 'Performance Metrics', icon: 'target', route: '/analytics/performance', roles: ['admin', 'supervisor'] },
        { id: 'revenue', label: 'Revenue Reports', icon: 'dollar-sign', route: '/analytics/revenue', roles: ['admin'] },
        { id: 'export', label: 'Data Export', icon: 'download', route: '/analytics/export', roles: ['admin', 'supervisor'] }
      ]
    },
    {
      id: 'mobile',
      label: 'Mobile Features',
      icon: 'smartphone',
      roles: ['admin', 'officer'],
      isExpanded: false,
      children: [
        { id: 'field-app', label: 'Field App', icon: 'mobile', route: '/mobile/field-app', roles: ['admin', 'officer'] },
        { id: 'gps-tracking', label: 'GPS Tracking', icon: 'navigation', route: '/mobile/gps', roles: ['admin', 'officer'] },
        { id: 'evidence', label: 'Evidence Capture', icon: 'camera', route: '/mobile/evidence', roles: ['admin', 'officer'] },
        { id: 'voice-reports', label: 'Voice Reports', icon: 'mic', route: '/mobile/voice', roles: ['admin', 'officer'] },
        { id: 'offline', label: 'Offline Mode', icon: 'wifi-off', route: '/mobile/offline', roles: ['admin', 'officer'] },
        { id: 'sync', label: 'Data Sync', icon: 'refresh-cw', route: '/mobile/sync', roles: ['admin', 'officer'] }
      ]
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: 'settings',
      roles: ['admin'],
      isExpanded: false,
      children: [
        { id: 'users', label: 'User Management', icon: 'users', route: '/settings/users', roles: ['admin'] },
        { id: 'roles', label: 'Role & Permissions', icon: 'key', route: '/settings/roles', roles: ['admin'] },
        { id: 'cameras', label: 'Camera Configuration', icon: 'video', route: '/settings/cameras', roles: ['admin'] },
        { id: 'notifications', label: 'Notification Settings', icon: 'bell', route: '/settings/notifications', roles: ['admin'] },
        { id: 'preferences', label: 'System Preferences', icon: 'sliders', route: '/settings/preferences', roles: ['admin'] },
        { id: 'security', label: 'Security Settings', icon: 'lock', route: '/settings/security', roles: ['admin'] },
        { id: 'logs', label: 'System Logs', icon: 'file-text', route: '/settings/logs', roles: ['admin'] },
        { id: 'backup', label: 'Data Backup', icon: 'hard-drive', route: '/settings/backup', roles: ['admin'] }
      ]
    },
    {
      id: 'support',
      label: 'Support & Help',
      icon: 'help-circle',
      roles: ['admin', 'officer', 'supervisor', 'dispatcher'],
      isExpanded: false,
      children: [
        { id: 'manual', label: 'User Manual', icon: 'book', route: '/support/manual', roles: ['admin', 'officer', 'supervisor', 'dispatcher'] },
        { id: 'tutorials', label: 'Video Tutorials', icon: 'play-circle', route: '/support/tutorials', roles: ['admin', 'officer', 'supervisor', 'dispatcher'] },
        { id: 'contact', label: 'Contact Support', icon: 'phone', route: '/support/contact', roles: ['admin', 'officer', 'supervisor', 'dispatcher'] },
        { id: 'report-issue', label: 'Report Issue', icon: 'bug', route: '/support/report', roles: ['admin', 'officer', 'supervisor', 'dispatcher'] },
        { id: 'features', label: 'Feature Requests', icon: 'lightbulb', route: '/support/features', roles: ['admin', 'officer', 'supervisor', 'dispatcher'] },
        { id: 'system-info', label: 'System Info', icon: 'info', route: '/support/info', roles: ['admin', 'supervisor'] }
      ]
    }
  ];

  menuItems = signal<MenuItem[]>([]); // This will hold the role-filtered menu

  currentRoute = signal<string>('');
  private isBrowser: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Set initial menu based on current user role
    this.menuItems.set(this.filterMenuByRole(this.allMenuItems, this.currentUser().role));

    // Restore expanded state from localStorage only if in browser
    if (this.isBrowser) {
      const storedExpanded = localStorage.getItem('expandedMenus');
      if (storedExpanded) {
        // Explicitly cast to string[] to resolve Set<unknown> error
        const expandedSet = new Set<string>(JSON.parse(storedExpanded) as string[]);
        this.menuItems.update(items => this.restoreExpandedState(items, expandedSet));
      }
    }

    // Listen to router events for active route and menu expansion
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute.set(event.urlAfterRedirects);
        this.updateMenuExpansionOnNavigate();
      }
    });

    // Initial check for active routes on load
    this.updateMenuExpansionOnNavigate();
  }

  // Helper to restore expanded state recursively
  private restoreExpandedState(items: MenuItem[], expandedSet: Set<string>): MenuItem[] {
    return items.map(item => {
      const newItem = { ...item };
      newItem.isExpanded = expandedSet.has(newItem.id);
      if (newItem.children) {
        newItem.children = this.restoreExpandedState(newItem.children, expandedSet);
      }
      return newItem;
    });
  }

  // Click outside listener for mobile sidebar
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.isBrowser && this.isMobileOpen() && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMobile.emit();
    }
  }

  // Toggle dropdown expansion for parent menu items
  toggleDropdown(clickedItem: MenuItem): void {
    this.menuItems.update(items => {
      return items.map(item => {
        if (item.id === clickedItem.id) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        // Close other top-level dropdowns if they are open
        return { ...item, isExpanded: false };
      });
    });

    // Persist expanded state to localStorage
    if (this.isBrowser) {
      const expandedIds = new Set<string>();
      this.menuItems().forEach(item => {
        if (item.isExpanded) {
          expandedIds.add(item.id);
        }
      });
      localStorage.setItem('expandedMenus', JSON.stringify(Array.from(expandedIds)));
    }
  }

  // Handle click on any menu item (parent or child)
  onMenuItemClick(item: MenuItem, event: Event): void {
    if (item.children && item.children.length > 0) {
      event.preventDefault(); // Prevent navigation for parent items
      this.toggleDropdown(item);
    } else {
      // For mobile, close sidebar on navigation
      if (this.isBrowser && this.isMobileOpen()) {
        this.closeMobile.emit();
      }
    }
  }

  // Filter menu items based on current user role (recursive)
  private filterMenuByRole(menu: MenuItem[], userRole: string): MenuItem[] {
    return menu.filter(item => {
      if (!item.roles.includes(userRole)) {
        return false;
      }
      if (item.children) {
        item.children = this.filterMenuByRole(item.children, userRole);
        // Only keep parent if it has at least one visible child
        return item.children.length > 0 || !item.route; // Keep parent if it has children or is a route itself
      }
      return true;
    });
  }

  // Check if a menu item is active (current route matches or a child is active)
  isActive(item: MenuItem): boolean {
    if (item.route) {
      // Check if the current route starts with the item's route
      return this.currentRoute().startsWith(item.route);
    }
    // For parent items, check if any child is active
    if (item.children) {
      return item.children.some((child) => this.isActive(child));
    }
    return false;
  }

  // Update menu expansion based on current route (for initial load/navigation)
  private updateMenuExpansionOnNavigate(): void {
    this.menuItems.update(items => {
      return items.map(item => {
        const newItem = { ...item };
        // Expand if it's the current route or if any of its children are active
        newItem.isExpanded = this.isActive(newItem);
        if (newItem.children) {
          newItem.children = this.updateChildMenuExpansion(newItem.children);
        }
        return newItem;
      });
    });

    // Persist expanded state to localStorage
    if (this.isBrowser) {
      const expandedIds = new Set<string>();
      this.menuItems().forEach(item => {
        if (item.isExpanded) {
          expandedIds.add(item.id);
        }
      });
      localStorage.setItem('expandedMenus', JSON.stringify(Array.from(expandedIds)));
    }
  }

  private updateChildMenuExpansion(children: MenuItem[]): MenuItem[] {
    return children.map(child => {
      const newChild = { ...child };
      newChild.isExpanded = this.isActive(newChild); // Recursively check active state
      if (newChild.children) {
        newChild.children = this.updateChildMenuExpansion(newChild.children);
      }
      return newChild;
    });
  }

  // Maps icon names to Font Awesome classes (as Lucide Icons would need a separate library)
  getIconClass(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      'home': 'fa-solid fa-house',
      'bar-chart': 'fa-solid fa-chart-bar',
      'pie-chart': 'fa-solid fa-chart-pie',
      'target': 'fa-solid fa-crosshairs',
      'activity': 'fa-solid fa-chart-line',
      'traffic-cone': 'fa-solid fa-traffic-cone',
      'monitor': 'fa-solid fa-desktop',
      'camera': 'fa-solid fa-camera',
      'alert-triangle': 'fa-solid fa-triangle-exclamation',
      'road': 'fa-solid fa-road',
      'cpu': 'fa-solid fa-microchip',
      'map': 'fa-solid fa-map',
      'users': 'fa-solid fa-users',
      'user-check': 'fa-solid fa-user-check',
      'user-plus': 'fa-solid fa-user-plus',
      'award': 'fa-solid fa-award',
      'trending-up': 'fa-solid fa-arrow-trend-up',
      'user-x': 'fa-solid fa-user-xmark',
      'shield-check': 'fa-solid fa-shield-halved',
      'graduation-cap': 'fa-solid fa-graduation-cap',
      'car': 'fa-solid fa-car',
      'truck': 'fa-solid fa-truck',
      'plus-circle': 'fa-solid fa-circle-plus',
      'map-pin': 'fa-solid fa-map-pin',
      'tool': 'fa-solid fa-wrench',
      'shield': 'fa-solid fa-shield-alt',
      'file-check': 'fa-solid fa-file-circle-check',
      'bar-chart-2': 'fa-solid fa-chart-line', // Similar to bar-chart
      'gavel': 'fa-solid fa-gavel',
      'list': 'fa-solid fa-list',
      'clock': 'fa-solid fa-clock',
      'eye': 'fa-solid fa-eye',
      'dollar-sign': 'fa-solid fa-dollar-sign',
      'file-text': 'fa-solid fa-file-lines',
      'trending-down': 'fa-solid fa-arrow-trend-down',
      'crosshair': 'fa-solid fa-crosshairs',
      'siren': 'fa-solid fa-bell', // Closest Font Awesome for siren
      'alert-circle': 'fa-solid fa-circle-exclamation',
      'radio': 'fa-solid fa-radio',
      'heart': 'fa-solid fa-heart-pulse',
      'phone': 'fa-solid fa-phone',
      'bug': 'fa-solid fa-bug',
      'lightbulb': 'fa-solid fa-lightbulb',
      'info': 'fa-solid fa-circle-info',
      'archive': 'fa-solid fa-box-archive',
      'smartphone': 'fa-solid fa-mobile-screen-button',
      'mobile': 'fa-solid fa-mobile-alt',
      'navigation': 'fa-solid fa-location-arrow',
      'mic': 'fa-solid fa-microphone',
      'wifi-off': 'fa-solid fa-wifi-slash',
      'refresh-cw': 'fa-solid fa-arrows-rotate',
      'settings': 'fa-solid fa-gear',
      'key': 'fa-solid fa-key',
      'video': 'fa-solid fa-video',
      'bell': 'fa-solid fa-bell',
      'sliders': 'fa-solid fa-sliders',
      'lock': 'fa-solid fa-lock',
      'hard-drive': 'fa-solid fa-hard-drive',
      'help-circle': 'fa-solid fa-circle-question',
      'book': 'fa-solid fa-book',
      'play-circle': 'fa-solid fa-circle-play',
      'file-plus': 'fa-solid fa-file-circle-plus',
      'calendar': 'fa-solid fa-calendar',
      'download': 'fa-solid fa-download'
    };
    return iconMap[iconName] || 'fa-solid fa-circle-question'; // Default icon if not found
  }

  // Method to get dynamic badge class (e.g., for different badge types)
  getBadgeClass(menuId: string): string {
    // You can implement logic here to return different classes based on menuId or badge type
    // For now, it just returns a generic class.
    if (menuId === 'violations' || menuId === 'pending' || menuId === 'ai-detections' || menuId === 'suspended' || menuId === 'emergency' || menuId === 'active-incidents') {
      return 'bg-red-500'; // Critical/alert badges
    }
    return 'bg-blue-500'; // Default info badge
  }
}
