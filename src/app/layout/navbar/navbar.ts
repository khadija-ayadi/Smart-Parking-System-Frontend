import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  constructor(public router: Router, public auth: AuthService) {}

  get isDashboard(): boolean {
    const dashboardRoutes = ['/admin', '/manager', '/driver'];
    return dashboardRoutes.some(r => this.router.url.startsWith(r));
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  goToDashboard() {
    const role = this.auth.getRole();
    if (role === 'Admin') this.router.navigate(['/admin']);
    else if (role === 'Manager') this.router.navigate(['/manager']);
    else this.router.navigate(['/driver']);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}