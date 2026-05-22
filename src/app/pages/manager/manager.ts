import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager.html',
  styleUrl: './manager.css'
})
export class ManagerComponent implements OnInit {
  API = 'http://localhost:5232/api';

  section = 'overview';
  pageTitle = 'Overview';

  // Data
  parkings: any[] = [];
  zones: any[] = [];
  filteredZones: any[] = [];
  spots: any[] = [];
  filteredSpots: any[] = [];

  // Overview counts
  counts = { p: 0, z: 0, s: 0, available: 0 };

  // Zone search
  zoneSearch = '';

  // Spot filters
  selectedParkingId: any = '';
  selectedZoneId: any = '';
  spotStatusFilter = 'all';
  zonesForFilter: any[] = [];
  spotsLoaded = false;

  // Loading states
  loadingParkings = false;
  loadingZones = false;
  loadingSpots = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadOverview();
  }

  show(sec: string) {
    this.section = sec;
    this.pageTitle = sec.charAt(0).toUpperCase() + sec.slice(1);
    if (sec === 'overview') this.loadOverview();
    if (sec === 'parkings') this.loadParkings();
    if (sec === 'zones') this.loadZones();
    if (sec === 'spots') this.loadParkings();
  }

  // ── Overview ──────────────────────────────────────────────
  loadOverview() {
    this.http.get<any[]>(this.API + '/parkings').subscribe(res => {
      this.counts.p = res.length;
    });
    this.http.get<any[]>(this.API + '/zones').subscribe(res => {
      this.counts.z = res.length;
    });
    this.http.get<any[]>(this.API + '/spots').subscribe(res => {
      this.counts.s = res.length;
      this.counts.available = res.filter(s => s.status === 0).length;
    });
  }

  // ── Parkings ──────────────────────────────────────────────
  loadParkings() {
    this.loadingParkings = true;
    this.http.get<any[]>(this.API + '/parkings').subscribe({
      next: data => {
        this.parkings = data;
        this.loadingParkings = false;
      },
      error: () => { this.loadingParkings = false; }
    });
  }

  // ── Zones ─────────────────────────────────────────────────
  loadZones() {
    this.loadingZones = true;
    this.http.get<any[]>(this.API + '/zones').subscribe({
      next: data => {
        this.zones = data;
        this.filteredZones = data;
        this.loadingZones = false;
      },
      error: () => { this.loadingZones = false; }
    });
  }

  filterZones() {
    const q = this.zoneSearch.toLowerCase();
    this.filteredZones = this.zones.filter(z =>
      z.name.toLowerCase().includes(q) ||
      z.parkingName?.toLowerCase().includes(q)
    );
  }

  viewSpotsByZone(zone: any) {
    this.section = 'spots';
    this.pageTitle = 'Spots';
    this.spotsLoaded = false;
    this.spots = [];
    this.filteredSpots = [];

    // pre-load parkings if not loaded
    if (this.parkings.length === 0) {
      this.loadParkings();
    }

    // Find parking for this zone and pre-select filters
    this.selectedZoneId = zone.id;
    this.selectedParkingId = zone.parkingId;
    this.spotStatusFilter = 'all';

    // Build zones for filter dropdown
    this.zonesForFilter = this.zones.filter(z => z.parkingId === zone.parkingId);

    this.loadSpots();
  }

  // ── Spots ─────────────────────────────────────────────────
  onParkingChange() {
    this.selectedZoneId = '';
    this.spots = [];
    this.filteredSpots = [];
    this.spotsLoaded = false;

    if (!this.selectedParkingId) {
      this.zonesForFilter = [];
      return;
    }

    // Populate zone dropdown from zones list or fetch
    if (this.zones.length > 0) {
      this.zonesForFilter = this.zones.filter(z => z.parkingId == this.selectedParkingId);
    } else {
      this.http.get<any[]>(this.API + '/zones').subscribe(data => {
        this.zones = data;
        this.zonesForFilter = data.filter(z => z.parkingId == this.selectedParkingId);
      });
    }

    // Load all spots for this parking via GET /spots (filtered client-side)
    this.loadSpots();
  }

  loadSpots() {
    this.loadingSpots = true;
    this.spotsLoaded = false;

    // If a specific zone is selected, use the zone endpoint
    if (this.selectedZoneId) {
      const url = this.spotStatusFilter === '0'
        ? `${this.API}/spots/available/by-zone/${this.selectedZoneId}`
        : `${this.API}/spots/by-zone/${this.selectedZoneId}`;

      this.http.get<any[]>(url).subscribe({
        next: data => {
          this.spots = data;
          this.applySpotFilter();
          this.loadingSpots = false;
          this.spotsLoaded = true;
        },
        error: () => { this.loadingSpots = false; }
      });
    } else if (this.selectedParkingId) {
      // No zone selected: load all spots and filter by parkingId client-side
      this.http.get<any[]>(this.API + '/spots').subscribe({
        next: data => {
          this.spots = data.filter(s => s.parkingId == this.selectedParkingId);
          this.applySpotFilter();
          this.loadingSpots = false;
          this.spotsLoaded = true;
        },
        error: () => { this.loadingSpots = false; }
      });
    } else {
      // Load all spots
      this.http.get<any[]>(this.API + '/spots').subscribe({
        next: data => {
          this.spots = data;
          this.applySpotFilter();
          this.loadingSpots = false;
          this.spotsLoaded = true;
        },
        error: () => { this.loadingSpots = false; }
      });
    }
  }

  applySpotFilter() {
    if (this.spotStatusFilter === 'all') {
      this.filteredSpots = [...this.spots];
    } else {
      const statusNum = parseInt(this.spotStatusFilter);
      this.filteredSpots = this.spots.filter(s => s.status === statusNum);
    }
  }

  // ── Toggle Spot Status (PATCH) ────────────────────────────
  toggleStatus(spot: any) {
    const newStatus = spot.status === 0 ? 1 : 0;
    spot.updating = true;

    this.http.patch(`${this.API}/spots/${spot.id}/status`, newStatus).subscribe({
      next: (res: any) => {
        spot.status = res.status ?? newStatus;
        spot.updating = false;
        this.applySpotFilter();
        // Refresh overview counts if on overview
        if (this.section === 'overview') this.loadOverview();
      },
      error: () => {
        spot.updating = false;
      }
    });
  }

  // ── Auth ──────────────────────────────────────────────────
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}