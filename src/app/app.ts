import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from "./layout/navbar/navbar";
import { SidebarComponent } from "./layout/sidebar/sidebar";
import { filter } from 'rxjs/operators';
import { ChatWidgetComponent } from './pages/home/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterModule, NavbarComponent, SidebarComponent, ChatWidgetComponent],
  template: `
     
    <ng-container *ngIf="isPublicRoute">
      <app-navbar />
      <router-outlet />
    </ng-container>

    
    <ng-container *ngIf="!isPublicRoute">
      <app-sidebar />
      <main class="dashboard-main">
        <router-outlet />
      </main>
    </ng-container>

    
    <app-chat-widget />
  `,
  styles: [`
    .dashboard-main {
      margin-left: 250px;
      min-height: 100vh;
      padding: 24px;
    }
  `]
})
export class AppComponent {
  isPublicRoute = true;

  private publicRoutes = ['/home', '/about', '/login', '/register', '/'];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.isPublicRoute = this.publicRoutes.some(r => e.urlAfterRedirects.startsWith(r));
      });
  }
}