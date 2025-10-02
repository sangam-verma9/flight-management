import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn() && this.authService.isAdmin()) {
      return true;
    }

    // Not admin, redirect to passenger dashboard or login
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/passenger-dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}