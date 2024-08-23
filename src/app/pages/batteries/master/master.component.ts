import { Component } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonCardHeader,
  IonContent,
  IonGrid,
  IonCol,
  IonRow,
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
  IonActionSheet,
} from '@ionic/angular/standalone';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db.service';
import { addIcons } from 'ionicons';
import { SettingsService } from '../../../services/settings.service';
import * as ionIcons from 'ionicons/icons';
import {
  batteryStatusActionEnum,
  batteryStatusDaysAlertEnum,
  BatteryStatusInterface,
} from 'src/app/interfaces/battery-status';
import { FillDbService } from 'src/app/services/fillDb.service';
import {
  BatteryAnagraphInterface,
  ExtendedBatteryAnagraphInterface,
} from 'src/app/interfaces/battery-anagraph';
import { differenceInDays, formatDuration } from 'date-fns';
import { ActionSheetController } from '@ionic/angular';

import { LocalNotifications } from '@capacitor/local-notifications';
import { BrandsAnagraphInterface } from 'src/app/interfaces/brands-anagraph';
import { BatteryTypeInterface } from 'src/app/interfaces/battery-type';

import { ModalController } from '@ionic/angular';
import { ModalResistanceLogsComponent } from '../modal/internal-resistance-logs.component';
import { BatteryResistanceLogInterface } from 'src/app/interfaces/battery-resistance';

@Component({
  selector: 'app-batteries-master',
  standalone: true,
  imports: [
    IonActionSheet,
    RouterLink,
    RouterOutlet,

    IonButton,
    IonButtons,
    IonCard,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonCardHeader,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
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
  items: ExtendedBatteryAnagraphInterface[] = [];
  page = 'batteries';
  debug = true;
  batteryStatusActionEnum = batteryStatusActionEnum;

  constructor(
    private db: DbService,
    private router: Router,
    private fillDb: FillDbService,
    private settings: SettingsService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
  ) {
    addIcons(ionIcons);
  }

  public async fillDatabase(){
    await this.fillDb.fillDb();
    await this.getItems();
  }

  async ionViewWillEnter() {
    console.info('[PAGE]: Start');
    try {
      await this.db.load();
      const forceLoading = true;
      await this.db.initService(forceLoading);

      if (this.settings.fillDb) {
        await this.fillDb.fillDb();
      }
  
      const stored = await LocalNotifications.getPending();
      
      await this.getItems();
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  async chargeBattery(item: ExtendedBatteryAnagraphInterface) {
    const dbItem: BatteryStatusInterface = {
      enabled: +true,
      deleted: +false,
      idBattery: item?.anag?.id!,
      status: batteryStatusActionEnum.Charge,
      date: new Date(),
    };

    await this.db.putItem<BatteryStatusInterface>('batteries-status', dbItem);
    await this.getItems();
  }

  async storeBattery(item: ExtendedBatteryAnagraphInterface) {
    const dbItem: BatteryStatusInterface = {
      enabled: +true,
      deleted: +false,
      idBattery: item?.anag?.id!,
      status: batteryStatusActionEnum.Store,
      date: new Date(),
    };
    await this.db.putItem<BatteryStatusInterface>('batteries-status', dbItem);
    await this.getItems();
  }

  async dischargeBattery(item: ExtendedBatteryAnagraphInterface) {
    const dbItem = {
      enabled: +true,
      deleted: +false,
      idBattery: item?.anag?.id!,
      status: batteryStatusActionEnum.Discharge,
      date: new Date(),
    };
    await this.db.putItem<BatteryStatusInterface>('batteries-status', dbItem);
    await this.getItems();
  }

  getBatteryStatus(status: number | undefined) {
    if (status) {
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
          },
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
          },
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
          },
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

  getAge(age: Date) {
    const differenceDays: number = differenceInDays(
      Date.now(),
      age?.getTime() as number,
    );
    const format = formatDuration(
      { days: differenceDays },
      { format: ['years', 'months', 'weeks', 'days'] },
    );
    return format;
  }

  async getItems() {
    try {
      const items: BatteryAnagraphInterface[] =
        await this.db.getItems<BatteryAnagraphInterface>('batteries-anag');

      // Sort items by id
      items.sort((a, b) => (a.id! > b.id! ? 1 : b.id! > a.id! ? -1 : 0));

      const objectStoreStatus = 'batteries-status';
      const objectStoreSeries = 'batteries-series';
      const objectStoreBrands = 'brands-anag';
      const objectStoreType = 'batteries-types';
      const objectStoreResistanceLogs = 'batteries-resistance-logs';
      const expandedItems: ExtendedBatteryAnagraphInterface[] = [];

      for (const anag of items) {
        try {
          // Fetching related data for each item

          const lastStatus: BatteryStatusInterface | undefined =
            await this.db.getLastStatusByDate<BatteryStatusInterface>(
              objectStoreStatus,
              anag.id!,
            );
          const series: BatteryAnagraphInterface | undefined =
            await this.db.getItem<BatteryAnagraphInterface>(
              objectStoreSeries,
              anag.seriesId,
              'id',
            );
          const type: BatteryTypeInterface | undefined =
            await this.db.getItem<BatteryTypeInterface>(
              objectStoreType,
              anag.typeId!,
              'id',
            );
          const brand: BrandsAnagraphInterface | undefined =
            await this.db.getItem<BrandsAnagraphInterface>(
              objectStoreBrands,
              anag.brandId!,
              'id',
            );
          const totalCycles: number | undefined = await this.db.getTotalCycles(
            objectStoreStatus,
            anag.id!,
          );
          const resistanceLogs: BatteryResistanceLogInterface[] =
            await this.db.getItems<BatteryResistanceLogInterface>(
              objectStoreResistanceLogs,
              'idBattery, enabled, deleted',
              [anag.id!, +true, +false],
            );

          // Calculate timerange as the difference between the last status date and the current date
          const timeRange = differenceInDays(
            Date.now(),
            lastStatus?.date?.getTime() as number,
          );
          const timeAgo = this.getAge(lastStatus?.date!);
          const lessThanWarningRange =
            timeRange <= batteryStatusDaysAlertEnum.Warning;
          const lessThanDangergRange =
            timeRange <= batteryStatusDaysAlertEnum.Danger;
          const moreThanDangerRange =
            timeRange > batteryStatusDaysAlertEnum.Danger;
          const alertStatus =
            lastStatus?.status !== batteryStatusActionEnum.Store &&
            lessThanWarningRange
              ? 'warning'
              : lastStatus?.status !== batteryStatusActionEnum.Store &&
                  lessThanDangergRange
                ? 'danger'
                : lastStatus?.status !== batteryStatusActionEnum.Store &&
                    moreThanDangerRange
                  ? 'danger'
                  : 'success';
          if(lastStatus?.status !== batteryStatusActionEnum.Store){
            this.setupLocalNotification(anag, lastStatus!);
          } else {
            LocalNotifications.cancel({ notifications: [
              { id: anag?.id! + 10}, 
              { id: anag?.id! + 20}, 
            ]});
          }
          

          const expandedItem: ExtendedBatteryAnagraphInterface = {
            anag,
            lastStatus,
            series,
            totalCycles,
            timeAgo,
            timeRange,
            alertStatus,
            type,
            brand,
            resistanceLogs,
          };

          // Add the expanded item to the array
          expandedItems.push(expandedItem);
        } catch (error) {
          console.error(`Error processing item with id ${anag.id}:`, error);
        }
      }
      const stored = await LocalNotifications.getPending();
      
      this.items = expandedItems;
      console.info('[PAGE]: Ready');
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }

  async showLogs(
    anag: BatteryAnagraphInterface,
  ) {
    let message =
      'This modal example uses the modalController to present and dismiss modals.';

    const modal = await this.modalCtrl.create({
      component: ModalResistanceLogsComponent,
      componentProps: {
        anag
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      message = `Hello, ${data}!`;
    }
  }

  async deleteItem(item: BatteryAnagraphInterface) {
    try {
      await this.db.deleteItem(this.page, item);
      await this.getItems(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  showDetail(item: BatteryAnagraphInterface) {
    this.router.navigate([`tabs/${this.page}/edit`, JSON.stringify(item.id)]);
  }

  trackById(index: number, item: BatteryAnagraphInterface) {
    return item.id;
  }

  async setupLN(){
    const granted = await LocalNotifications.requestPermissions();
    if (granted.display === 'granted') {
      
      this.items.map(async el => {
        const objectStoreStatus = 'batteries-status';
        const lastStatus: BatteryStatusInterface | undefined =
            await this.db.getLastStatusByDate<BatteryStatusInterface>(
              objectStoreStatus,
              el.anag.id!,
            );
        el.lastStatus = lastStatus;
        this.setupLocalNotification(el.anag, el.lastStatus!)
      })
    } 
    
  }

  async setupLocalNotification(anag: BatteryAnagraphInterface, lastStatus: BatteryStatusInterface) {
    // Request permission for iOS or check if already granted
    

    
      const notifications = [
        {
          title: anag.label + ' Warning',
          body: 'Battery ' + anag.label + ' has been ' + batteryStatusActionEnum[lastStatus.status!] + 'd 3 days ago. Please put it in Storage to preserve battery life',
          id: anag?.id! + 10,
          schedule: {
            at: new Date(
              new Date().getTime() +
                batteryStatusDaysAlertEnum.Warning * 86_400 * 1000,
            ),
          }, // 3 * 86_400 * 1000 seconds in a day
          actionTypeId: '',
          extra: null,
        },
        {
          title: anag.label + ' Warning',
          body: 'Battery ' + anag.label + ' has been ' + batteryStatusActionEnum[lastStatus.status!] + 'd 3 days ago. Please put it in Storage to preserve battery life',
          id: anag?.id! + 20,
          schedule: {
            at: new Date(
              new Date().getTime() +
                batteryStatusDaysAlertEnum.Danger * 86_400 * 1000,
            ),
          }, // 5 * 86_400 * 1000 seconds in a day
          actionTypeId: '',
          extra: null,
        },
      ];
      await LocalNotifications.schedule({
        notifications,
      });
    
  }
}
