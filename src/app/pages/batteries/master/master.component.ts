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
import { batteryStatusActionEnum, batteryStatusDaysAlertEnum, BatteryStatusInterface } from 'src/app/interfaces/battery-status';
import { FillDbService } from 'src/app/services/fillDb.service';
import { BatteryAnagraphInterface, ExtendedBatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';
import { differenceInDays } from 'date-fns';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-batteries-master',
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
  templateUrl: './master.component.html',
  styleUrl: './master.component.scss',
})
export class BatteriesMasterComponent {
  @ViewChildren('slidingItems') private slidingItems: IonItemSliding[] = [];
  items: ExtendedBatteryAnagraphInterface[] = [];
  page = 'batteries';
  debug = true;
  batteryStatusActionEnum = batteryStatusActionEnum;

  constructor(
    private db: DbService,
    private router: Router,
    private fillDb: FillDbService,
    private settings: SettingsService,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons(ionIcons);
  }

  chargeBattery(item: ExtendedBatteryAnagraphInterface){

  }

  storeBattery(item: ExtendedBatteryAnagraphInterface){
    
  }

  dischargeBattery(item: ExtendedBatteryAnagraphInterface){
    
  }

  getBatteryStatus(status: number | undefined){
    if(status) {
      return batteryStatusActionEnum[status]; 
    }
    return;
  }

  async presentActionSheet(item: ExtendedBatteryAnagraphInterface) {
    const status: number | undefined = item?.lastStatus?.status;
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Actions',
      
      
      buttons: [
        {
          disabled: status === batteryStatusActionEnum.Charge,
          icon: 'battery-full',
          text: 'Charge',
          data: {
            action: 'charge',
          },
          handler: () => {
            this.chargeBattery(item);
          }
        },
        {
          disabled: status === batteryStatusActionEnum.Store,
          text: 'Store',
          icon: 'battery-half-outline',
          data: {
            action: 'store',
          },
          handler: () => {
            this.storeBattery(item);
          }
        },
        {
          disabled: status === batteryStatusActionEnum.Discharge,
          text: 'Discharge',
          icon: 'battery-dead-outline',
          data: {
            action: 'discharge',
          },
          handler: () => {
            this.dischargeBattery(item);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    

    await actionSheet.present();
  }

  // Using Ionic lifecycle hook to initialize data when the view is about to be presented
  async ionViewWillEnter() {
    console.info('[PAGE]: Start');
    try {
      await this.db.load();
      const forceLoading = true;
      await this.db.initService(forceLoading);

      if(this.settings.fillDb) {
        await this.fillDb.fillDb();
      }

      await this.getItems();


      

    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  async getItems() {
    try {
      const items: BatteryAnagraphInterface[] = (await this.db.getItems<BatteryAnagraphInterface>('batteries-anag'));
      
      // Sort items by id
      items.sort((a, b) => (a.id! > b.id! ? 1 : b.id! > a.id! ? -1 : 0));
      
      const objectStoreStatus = "batteries-status";
      const objectStoreSeries = "batteries-series";
      const expandedItems: ExtendedBatteryAnagraphInterface[] = [];
  
      for (const anag of items) {
        try {
          // Fetching related data for each item
          const lastStatus: BatteryStatusInterface | undefined = await this.db.getLastStatusByDate<BatteryStatusInterface>(objectStoreStatus, 'date');
          const series: BatteryAnagraphInterface | undefined = await this.db.getItem<BatteryAnagraphInterface>(objectStoreSeries, anag.seriesId);
          const totalCycles: number | undefined = await this.db.getTotalCycles(objectStoreStatus, anag.id!);
          
          // Calculate timerange as the difference between the last status date and the current date
          const timeRange = differenceInDays( Date.now(), lastStatus!.date.getTime());
          const alertLevel = 
            lastStatus!.status !== batteryStatusActionEnum.Store && timeRange <= batteryStatusDaysAlertEnum.Warning ? 'warning' : 
            lastStatus!.status !== batteryStatusActionEnum.Store && timeRange <= batteryStatusDaysAlertEnum.Danger ? 'danger' :
            lastStatus!.status !== batteryStatusActionEnum.Store && timeRange > batteryStatusDaysAlertEnum.Danger ? 'danger' : 'success'; 

          const expandedItem: ExtendedBatteryAnagraphInterface = { anag, lastStatus, series, totalCycles, timeRange, alertLevel };
          
          // Add the expanded item to the array
          expandedItems.push(expandedItem);
        } catch (error) {
          console.error(`Error processing item with id ${anag.id}:`, error);
        }
      }
  
      this.items = expandedItems; // Assign the array after it is fully populated
  
      console.log(this.items);
      console.info('[PAGE]: Ready');
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }
  

  async deleteItem(item: BatteryAnagraphInterface) {
    try {
      this.slidingItems.forEach((el) => {
        el.closeOpened();
      });
      await this.db.deleteItem(this.page, item);
      await this.getItems(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  showDetail(item: BatteryAnagraphInterface) {
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
