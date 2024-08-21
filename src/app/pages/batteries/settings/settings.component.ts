import { Component, ViewChildren } from '@angular/core';
import { DatePipe } from '@angular/common';
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
  RefresherCustomEvent, IonActionSheet, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonInput, IonToggle } from '@ionic/angular/standalone';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db.service';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { batteryStatusActionEnum  } from 'src/app/interfaces/battery-status';
import { BatteryAnagraphInterface, BatterySeriesAnagraphInterface, ExtendedBatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';
import { BrandsAnagraphInterface } from 'src/app/interfaces/brands-anagraph';
import { BatteryTypeInterface } from 'src/app/interfaces/battery-type';
import { SettingsService } from 'src/app/services/settings.service';
import { FillDbService } from 'src/app/services/fillDb.service';

@Component({
  selector: 'app-batteries-settings',
  standalone: true,
  imports: [IonToggle, IonInput, 
    RouterLink,
    RouterOutlet,
    DatePipe,

    IonCol, IonRow, IonGrid, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonActionSheet, 
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
  page = 'settings';
  debug = true;
  batteryStatusActionEnum = batteryStatusActionEnum;

  series: BatterySeriesAnagraphInterface[] = [];
  types: BatteryTypeInterface[] = [];
  brands: BrandsAnagraphInterface[] = [];
  batteries: ExtendedBatteryAnagraphInterface[] = [];

  constructor(
    private db: DbService,
    private router: Router,
    private settings: SettingsService,
    private fillDb: FillDbService
  ) {
    addIcons(ionIcons);
  }

  async ionViewWillEnter() {
    if(this.settings.fillDb) {
      await this.fillDb.fillDb();
    }

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
      const objectStoreTypes = "batteries-types";
      const objectStoreBrands = "brands-anag";
      const objectStoreBatteries = "batteries-anag";
      const series: BatterySeriesAnagraphInterface[] = await this.db.getItems<BatterySeriesAnagraphInterface>(objectStoreSeries);
      const anagArr: BatteryAnagraphInterface[] = await this.db.getItems<BatteryAnagraphInterface>(objectStoreBatteries);
      const types: BatteryTypeInterface[] = await this.db.getItems<BatteryTypeInterface>(objectStoreTypes);
      const brands: BrandsAnagraphInterface[] = await this.db.getItems<BrandsAnagraphInterface>(objectStoreBrands);
      const batteries: ExtendedBatteryAnagraphInterface[] = [];

      anagArr.map(async anag => {
        const batterySeries: BatteryAnagraphInterface | undefined = await this.db.getItem<BatteryAnagraphInterface>(objectStoreSeries, anag.seriesId, 'id');
        const batteryType: BatteryTypeInterface | undefined = await this.db.getItem<BatteryTypeInterface>(objectStoreTypes, anag.typeId!, 'id');
        const batteryBrand: BrandsAnagraphInterface | undefined = await this.db.getItem<BrandsAnagraphInterface>(objectStoreBrands, anag.brandId!, 'id');
        console.log(batteryType)
        batteries.push({anag, series: batterySeries, type: batteryType, brand: batteryBrand})
      });

      

      this.series = series;
      this.types = types;
      this.brands = brands;
      this.batteries = batteries;
      
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
