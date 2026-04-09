import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { SidebarComponent } from '../../layout/sidebar/sidebar';
import { Router } from '@angular/router';



@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})


export class AdminComponent implements OnInit {

  API = 'http://localhost:5232/api';

  section = 'overview';
  pageTitle = 'Overview';

  parkings: any[] = [];
  zones: any[] = [];
  spots: any[] = [];
  users: any[] = [];

  counts = { p: 0, z: 0, s: 0, u: 0 };

  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit() {
    this.loadOverview();
  }

  show(sec: string) {
    this.section = sec;
    this.pageTitle = sec.charAt(0).toUpperCase() + sec.slice(1);
    this.load(sec);
  }

  load(sec: string) {
    if (sec === 'overview') this.loadOverview();
    if (sec === 'parkings') this.loadParkings();
  }

  loadOverview() {
    this.http.get<any[]>(this.API + '/parkings').subscribe(res => {
      this.counts.p = res.length;
    });

    this.http.get<any[]>(this.API + '/zones').subscribe(res => {
      this.counts.z = res.length;
    });

    this.http.get<any[]>(this.API + '/spots').subscribe(res => {
      this.counts.s = res.length;
    });

    this.http.get<any[]>(this.API + '/users').subscribe(res => {
      this.counts.u = res.length;
    });
  }

  loadParkings() {
    this.http.get<any[]>(this.API + '/parkings')
      .subscribe(data => this.parkings = data);
  }

  deleteParking(id: number) {
    this.http.delete(this.API + '/parkings/' + id)
      .subscribe(() => this.loadParkings());
  }

  openModal(type: string) {
    console.log('Open modal for', type);
  }

  editParking(p: any) {
    console.log('Edit', p);
  }

  logout() {
      localStorage.removeItem('token');
      this.router.navigate(['/']);
    }
}