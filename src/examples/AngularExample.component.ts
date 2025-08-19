import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription, interval } from 'rxjs';
import { FusionStateService } from '../adapters/angular/fusion-state.service';

interface User {
  name: string;
  email: string;
}

interface Settings {
  darkMode: boolean;
  notifications: boolean;
  language: string;
}

@Component({
  selector: 'app-angular-fusion-state-example',
  template: `
    <div class="angular-fusion-state-example">
      <h1>Angular Fusion State Example</h1>
      
      <!-- Basic Counter -->
      <section class="example-section">
        <h2>Basic Counter</h2>
        <div class="counter">
          <p>Count: {{ count$ | async }}</p>
          <div class="button-group">
            <button (click)="increment()" class="btn btn-primary">+</button>
            <button (click)="decrement()" class="btn btn-secondary">-</button>
            <button (click)="reset()" class="btn btn-outline">Reset</button>
          </div>
        </div>
      </section>

      <!-- User Profile -->
      <section class="example-section">
        <h2>User Profile</h2>
        <div class="user-profile">
          <div class="form-group">
            <label>Name:</label>
            <input 
              [(ngModel)]="localName" 
              (blur)="updateUserName()"
              placeholder="Enter your name"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Email:</label>
            <input 
              [(ngModel)]="localEmail" 
              (blur)="updateUserEmail()"
              placeholder="Enter your email"
              class="form-input"
            />
          </div>
          <div class="user-display" *ngIf="user$ | async as user">
            <h3>Current User:</h3>
            <p><strong>Name:</strong> {{ user.name || 'Not set' }}</p>
            <p><strong>Email:</strong> {{ user.email || 'Not set' }}</p>
          </div>
        </div>
      </section>

      <!-- Persistent Settings -->
      <section class="example-section">
        <h2>Persistent Settings</h2>
        <div class="settings" *ngIf="settings$ | async as settings">
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                [checked]="settings.darkMode"
                (change)="toggleDarkMode($event)"
              />
              Dark Mode
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input 
                type="checkbox" 
                [checked]="settings.notifications"
                (change)="toggleNotifications($event)"
              />
              Enable Notifications
            </label>
          </div>
          <div class="setting-item">
            <label>Language:</label>
            <select 
              [value]="settings.language"
              (change)="updateLanguage($event)"
              class="form-select"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Real-time Data -->
      <section class="example-section">
        <h2>Real-time Data</h2>
        <div class="realtime-data">
          <p>Last Update: {{ lastUpdate$ | async | date:'medium' }}</p>
          <p>Random Value: {{ randomValue$ | async }}</p>
          <button (click)="generateRandomData()" class="btn btn-accent">
            Generate Random Data
          </button>
        </div>
      </section>

      <!-- State Debug Info -->
      <section class="example-section">
        <h2>Debug Information</h2>
        <div class="debug-info">
          <button (click)="toggleDebug()" class="btn btn-outline">
            {{ showDebug ? 'Hide' : 'Show' }} Debug Info
          </button>
          <pre *ngIf="showDebug" class="debug-output">{{ debugInfo }}</pre>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .angular-fusion-state-example {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .example-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .example-section h2 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #007acc;
      padding-bottom: 10px;
    }

    .counter {
      text-align: center;
    }

    .counter p {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #007acc;
    }

    .button-group {
      display: flex;
      gap: 10px;
      justify-content: center;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #007acc;
      color: white;
    }

    .btn-primary:hover {
      background: #005a9e;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-outline {
      background: transparent;
      color: #007acc;
      border: 1px solid #007acc;
    }

    .btn-outline:hover {
      background: #007acc;
      color: white;
    }

    .btn-accent {
      background: #28a745;
      color: white;
    }

    .btn-accent:hover {
      background: #218838;
    }

    .user-profile {
      display: grid;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .form-group label {
      font-weight: 500;
      color: #555;
    }

    .form-input, .form-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .form-input:focus, .form-select:focus {
      outline: none;
      border-color: #007acc;
      box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
    }

    .user-display {
      padding: 15px;
      background: white;
      border-radius: 4px;
      border-left: 4px solid #007acc;
    }

    .settings {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .setting-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .setting-item label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .realtime-data {
      text-align: center;
    }

    .realtime-data p {
      margin: 10px 0;
      font-family: monospace;
      background: white;
      padding: 10px;
      border-radius: 4px;
      border-left: 4px solid #28a745;
    }

    .debug-info {
      text-align: center;
    }

    .debug-output {
      background: #2d3748;
      color: #e2e8f0;
      padding: 20px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      line-height: 1.4;
      margin-top: 15px;
      text-align: left;
    }

    @media (max-width: 600px) {
      .angular-fusion-state-example {
        padding: 10px;
      }
      
      .button-group {
        flex-direction: column;
      }
      
      .setting-item {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class AngularFusionStateExampleComponent implements OnInit, OnDestroy {
  // Observables for reactive state
  count$: Observable<number>;
  user$: Observable<User>;
  settings$: Observable<Settings>;
  lastUpdate$: Observable<string>;
  randomValue$: Observable<number>;

  // Local form state
  localName = '';
  localEmail = '';

  // Debug state
  showDebug = false;
  debugInfo = '';

  // Subscriptions for cleanup
  private subscriptions: Subscription[] = [];

  // Interval for auto-generating data
  private dataInterval?: Subscription;

  constructor(private fusionState: FusionStateService) {
    // Initialize observables
    this.count$ = this.fusionState.select<number>('count', 0);
    this.user$ = this.fusionState.select<User>('user', { name: '', email: '' });
    this.settings$ = this.fusionState.select<Settings>('persist.settings', {
      darkMode: false,
      notifications: true,
      language: 'en'
    });
    this.lastUpdate$ = this.fusionState.select<string>('lastUpdate', new Date().toISOString());
    this.randomValue$ = this.fusionState.select<number>('randomValue', 0);
  }

  ngOnInit(): void {
    // Subscribe to user changes to update local form state
    const userSub = this.user$.subscribe(user => {
      this.localName = user.name;
      this.localEmail = user.email;
    });
    this.subscriptions.push(userSub);

    // Auto-generate random data every 5 seconds
    this.dataInterval = interval(5000).subscribe(() => {
      this.generateRandomData();
    });

    // Update debug info periodically
    const debugSub = interval(1000).subscribe(() => {
      if (this.showDebug) {
        this.debugInfo = JSON.stringify(this.fusionState.getDebugInfo(), null, 2);
      }
    });
    this.subscriptions.push(debugSub);
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.dataInterval) {
      this.dataInterval.unsubscribe();
    }
  }

  // Counter methods
  increment(): void {
    const currentCount = this.fusionState.getValue<number>('count') || 0;
    this.fusionState.setValue('count', currentCount + 1);
  }

  decrement(): void {
    const currentCount = this.fusionState.getValue<number>('count') || 0;
    this.fusionState.setValue('count', currentCount - 1);
  }

  reset(): void {
    this.fusionState.setValue('count', 0);
  }

  // User profile methods
  updateUserName(): void {
    const currentUser = this.fusionState.getValue<User>('user') || { name: '', email: '' };
    this.fusionState.setValue('user', { ...currentUser, name: this.localName });
  }

  updateUserEmail(): void {
    const currentUser = this.fusionState.getValue<User>('user') || { name: '', email: '' };
    this.fusionState.setValue('user', { ...currentUser, email: this.localEmail });
  }

  // Settings methods
  toggleDarkMode(event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentSettings = this.fusionState.getValue<Settings>('persist.settings') || {
      darkMode: false,
      notifications: true,
      language: 'en'
    };
    this.fusionState.setValue('persist.settings', {
      ...currentSettings,
      darkMode: target.checked
    });
  }

  toggleNotifications(event: Event): void {
    const target = event.target as HTMLInputElement;
    const currentSettings = this.fusionState.getValue<Settings>('persist.settings') || {
      darkMode: false,
      notifications: true,
      language: 'en'
    };
    this.fusionState.setValue('persist.settings', {
      ...currentSettings,
      notifications: target.checked
    });
  }

  updateLanguage(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const currentSettings = this.fusionState.getValue<Settings>('persist.settings') || {
      darkMode: false,
      notifications: true,
      language: 'en'
    };
    this.fusionState.setValue('persist.settings', {
      ...currentSettings,
      language: target.value
    });
  }

  // Real-time data methods
  generateRandomData(): void {
    this.fusionState.setValue('randomValue', Math.floor(Math.random() * 1000));
    this.fusionState.setValue('lastUpdate', new Date().toISOString());
  }

  // Debug methods
  toggleDebug(): void {
    this.showDebug = !this.showDebug;
    if (this.showDebug) {
      this.debugInfo = JSON.stringify(this.fusionState.getDebugInfo(), null, 2);
    }
  }
}
