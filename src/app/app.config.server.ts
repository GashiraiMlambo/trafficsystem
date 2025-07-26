import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config'; // Import your base app config
import { provideServerRendering } from '@angular/platform-server'; // Import provideServerRendering

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering() // Essential for SSR
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);