import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser'; // Use bootstrapApplication here
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server'; // Your server-specific config

// Enable production mode in Node.js environment
if (process.env['NODE_ENV'] === 'production') {
  enableProdMode();
}

// CORRECTED: The bootstrap function should call bootstrapApplication
// which returns a Promise<ApplicationRef>
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;