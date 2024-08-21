import { Component, ViewChildren } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent, IonActionSheet, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db.service';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { batteryStatusActionEnum  } from 'src/app/interfaces/battery-status';
import { BatteryAnagraphInterface, BatterySeriesAnagraphInterface, ExtendedBatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';
import { BrandsAnagraphInterface } from 'src/app/interfaces/brands-anagraph';
import { BatteryTypeInterface } from 'src/app/interfaces/battery-type';

@Component({
  selector: 'app-batteries-settings',
  standalone: true,
  imports: [IonCol, IonRow, IonGrid, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonActionSheet, 
    RouterLink,
    RouterOutlet,

    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonRefresher,
    IonRefresherContent,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class BatteriesSettingComponent {
  @ViewChildren('slidingItems') private slidingItems: IonItemSliding[] = [];
  items: Partial<ExtendedBatteryAnagraphInterface>[] = [];
  page = 'batteries';
  debug = true;
  batteryStatusActionEnum = batteryStatusActionEnum;

  series: BatterySeriesAnagraphInterface[] = [];
  types: BatteryTypeInterface[] = [];
  brands: BrandsAnagraphInterface[] = [];

  constructor(
    private db: DbService,
    private router: Router,
  ) {
    addIcons(ionIcons);
  }

  async ionViewWillEnter() {
    console.info('[PAGE]: Start');
    try {
      await this.db.load();
      const forceLoading = true;
      await this.db.initService(forceLoading);

      await this.getItems();   

    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  async getItems() {
    try {
      const objectStoreSeries = "batteries-series";
      const objectStoreTypes = "batteries-series";
      const objectStoreBrands = "batteries-series";
      const series: BatterySeriesAnagraphInterface[] = await this.db.getItems<BatterySeriesAnagraphInterface>(objectStoreSeries);
      const types: BatteryTypeInterface[] = await this.db.getItems<BatteryTypeInterface>(objectStoreTypes);
      const brands: BrandsAnagraphInterface[] = await this.db.getItems<BrandsAnagraphInterface>(objectStoreBrands);
      this.series = series;
      this.types = types;
      this.brands = brands;
      
      console.info('[PAGE]: Ready');
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }
  

  async deleteItem(item: Partial<ExtendedBatteryAnagraphInterface>) {
    try {
      this.slidingItems.forEach((el) => {
        el.closeOpened();
      });

      const { anag } = item;

      const deleteItem: BatteryAnagraphInterface | undefined = anag;

      await this.db.deleteItem(this.page, deleteItem!);
      await this.getItems(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  showDetail(item: Partial<ExtendedBatteryAnagraphInterface>) {
    this.slidingItems.forEach((el) => {
      el.closeOpened();
    });
    this.router.navigate([`tabs/${this.page}/edit`, JSON.stringify(item?.anag?.id)]);
  }

  async doRefresh(refresher: RefresherCustomEvent) {
    try {
      this.slidingItems.forEach((el) => {
        el.closeOpened();
      });
      const forceLoading = true;
      await this.db.initService(forceLoading);
      await this.getItems();
      refresher.target.complete();
    } catch (error) {
      refresher.target.complete();
      console.error('Error refreshing items:', error);
    }
  }

  trackById(index: number, item: BatteryAnagraphInterface) {
    return item.id;
  }

}
