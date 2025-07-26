import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config'; // Assuming you have an app.config.ts for providers
import { AppComponent } from './app/app.component'; // Import your main app component

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
