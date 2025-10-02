import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';

// Services
import { ApiService } from './app/services/api.service';
import { AuthService } from './app/services/auth.service';
import { FlightService } from './app/services/flight.service';
import { BookingService } from './app/services/booking.service';
import { AdminService } from './app/services/admin.service';

// Guards
import { AuthGuard } from './app/guards/auth-guard';
import { AdminGuard } from './app/guards/admin-guard';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    ApiService,
    AuthService,
    FlightService,
    BookingService,
    AdminService,
    AuthGuard,
    AdminGuard
  ]
}).catch(err => console.error(err));