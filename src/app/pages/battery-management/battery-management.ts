import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Sqlite } from '@services/database/database.service';
import { Battery, Brand, Series, BatteryType } from '@interfaces/index';
import { ToastService } from '@services/ui/toast';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import {
  IonItem,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  SegmentChangeEventDetail,
  IonSpinner,
} from '@ionic/angular/standalone';
import { BatteryListComponent } from './battery-list/battery-list.component';
import { BrandListComponent } from './brand-list/brand-list.component';
import { SeriesListComponent } from './series-list/series-list.component';
import { TypeListComponent } from './type-list/type-list.component';

@Component({
  selector: 'app-battery-management',
  imports: [
    CommonModule,
    IonItem,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    TranslocoModule,
    IonSpinner,
    BatteryListComponent,
    BrandListComponent,
    SeriesListComponent,
    TypeListComponent,
  ],
  templateUrl: './battery-management.html',
  styleUrl: './battery-management.scss',
})
export class BatteryManagement implements OnInit, OnDestroy {
  private sqlite = inject(Sqlite);
  private router = inject(Router);
  private toast = inject(ToastService);
  private transloco = inject(TranslocoService); // Inject TranslocoService
  private routerSubscription?: Subscription;

  // Active tab
  protected activeTab = signal<'batteries' | 'brands' | 'series' | 'types'>('batteries');

  // Data signals
  protected batteries = signal<Battery[]>([]);
  protected brands = signal<Brand[]>([]);
  protected series = signal<Series[]>([]);
  protected types = signal<BatteryType[]>([]);

  // Loading states
  protected isLoading = signal(false);

  async ngOnInit() {
    await this.loadAllData();

    // Subscribe to router events to update active tab based on URL
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveTabFromUrl(event.urlAfterRedirects);
      });

    // Set initial active tab based on current route
    this.updateActiveTabFromUrl(this.router.url);
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  private updateActiveTabFromUrl(url: string) {
    const clearUrl = url.split('?')[0].split('/').pop() || 'batteries'; // Remove query params if any and get last segment
    this.activeTab.set(clearUrl as 'batteries' | 'brands' | 'series' | 'types');
  }

  private async loadAllData() {
    this.isLoading.set(true);
    try {
      const [batteries, brands, series, types] = await Promise.all([
        this.sqlite.getBatteries(),
        this.sqlite.getBrands(),
        this.sqlite.getSeries(),
        this.sqlite.getTypes(),
      ]);

      console.log('Loading data:', {
        batteries: batteries.length,
        brands: brands.length,
        series: series.length,
        types: types.length,
      });
      this.batteries.set(batteries);
      this.brands.set(brands);
      this.series.set(series);
      this.types.set(types);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected setActiveTab(tab: 'batteries' | 'brands' | 'series' | 'types') {
    this.activeTab.set(tab);
  }

  protected onTabChange(event: CustomEvent<SegmentChangeEventDetail>) {
    this.router.navigate([`/manage/${event.detail.value}`]);
  }

  // Handle data refresh when subcomponents modify data
  protected async refreshData() {
    await this.loadAllData();
  }
}
