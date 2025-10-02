import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent)
    },

    // Passenger Routes
    {
        path: 'passenger-dashboard',
        loadComponent: () => import('./components/passenger-dashboard/passenger-dashboard').then(m => m.PassengerDashboardComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'flight-search',
        loadComponent: () => import('./components/flight-search/flight-search').then(m => m.FlightSearchComponent),
        canActivate: [AuthGuard]
    },
    {
        path: 'booking-history',
        loadComponent: () => import('./components/booking-history/booking-history').then(m => m.BookingHistoryComponent),
        canActivate: [AuthGuard]
    },

    // Admin Routes
    {
        path: 'admin-dashboard',
        loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent),
        canActivate: [AuthGuard, AdminGuard]
    },
    {
        path: 'flight-management',
        loadComponent: () => import('./components/flight-management/flight-management').then(m => m.FlightManagementComponent),
        canActivate: [AuthGuard, AdminGuard]
    },
    {
        path: 'schedule-management',
        loadComponent: () => import('./components/schedule-management/schedule-management').then(m => m.ScheduleManagementComponent),
        canActivate: [AuthGuard, AdminGuard]
    },
    {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports').then(m => m.ReportsComponent),
        canActivate: [AuthGuard, AdminGuard]
    },

    // Wildcard route
    {
        path: '**',
        redirectTo: '/login'
    }
];