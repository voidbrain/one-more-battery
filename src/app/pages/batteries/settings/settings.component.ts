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
  RefresherCustomEvent, IonActionSheet } from '@ionic/angular/standalone';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db.service';
import { addIcons } from 'ionicons';
import { SettingsService } from '../../../services/settings.service'
import * as ionIcons from 'ionicons/icons';
import { batteryStatusActionEnum  } from 'src/app/interfaces/battery-status';
import { FillDbService } from 'src/app/services/fillDb.service';
import { BatteryAnagraphInterface, ExtendedBatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';
import { BrandsAnagraphInterface } from 'src/app/interfaces/brands-anagraph';

@Component({
  selector: 'app-batteries-settings',
  standalone: true,
  imports: [IonActionSheet, 
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

  constructor(
    private db: DbService,
    private router: Router,
    private fillDb: FillDbService,
    private settings: SettingsService,
  ) {
    addIcons(ionIcons);
  }

  // Using Ionic lifecycle hook to initialize data when the view is about to be presented
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
      const items: BatteryAnagraphInterface[] = (await this.db.getItems('batteries-anag')) as BatteryAnagraphInterface[];
      
      // Sort items by id
      items.sort((a, b) => (a.id! > b.id! ? 1 : b.id! > a.id! ? -1 : 0));
      
      const objectStoreBrands = "brands-anag";
      const objectStoreSeries = "batteries-series";
      const expandedItems: Partial<ExtendedBatteryAnagraphInterface>[] = [];
  
      for (const item of items) {
        try {
          // Fetching related data for each item
         
          const series: BatteryAnagraphInterface = await this.db.getItem(objectStoreSeries, item.seriesId) as BatteryAnagraphInterface;
          const brand: BrandsAnagraphInterface = await this.db.getItem(objectStoreBrands, item.brandId!) as BrandsAnagraphInterface;
         
          
          // Calculate timerange as the difference between the last status date and the current date
         
          const expandedItem: Partial<ExtendedBatteryAnagraphInterface> = { ...item, series, brand};
          
          // Add the expanded item to the array
          expandedItems.push(expandedItem);
        } catch (error) {
          console.error(`Error processing item with id ${item.id}:`, error);
        }
      }
  
      this.items = expandedItems; // Assign the array after it is fully populated
  
      console.log(this.items);
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

      const deleteItem: BatteryAnagraphInterface = {
        id: item.id,
        enabled: item.enabled!,
        deleted: item.deleted!,
        cellsNumber: item.cellsNumber,
        typeId: item.typeId,
        model: item.model,
        brandId: item.brandId,
        label: item.label!,
        seriesId: item.seriesId!,
      }

      await this.db.deleteItem(this.page, deleteItem);
      await this.getItems(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  showDetail(item: Partial<ExtendedBatteryAnagraphInterface>) {
    this.slidingItems.forEach((el) => {
      el.closeOpened();
    });
    this.router.navigate([`tabs/${this.page}/edit`, JSON.stringify(item.id)]);
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
