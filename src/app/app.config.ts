import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes'; // Import your defined routes

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes)
    // Add other providers here if needed, e.g., provideHttpClient()
  ]
};
