import { Component } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { Platform } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
  IonToggle,
  IonToolbar,
  IonActionSheet,
  IonAlert,
} from '@ionic/angular/standalone';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db.service';
import { addIcons } from 'ionicons';
import { dbTables, SettingsService } from '../../../services/settings.service';
import * as ionIcons from 'ionicons/icons';
import {
  batteryStatusActionEnum,
  batteryStatusDaysAlertEnum,
  BatteryStatusInterface,
} from 'src/app/interfaces/battery-status';



import {
  BatteryAnagraphInterface,
  ExtendedBatteryAnagraphInterface,
  ExtendedSeriesAnagraph,
} from 'src/app/interfaces/battery-anagraph';
import { differenceInDays, formatDuration, intervalToDuration } from 'date-fns';
import { ActionSheetController, AlertController } from '@ionic/angular/standalone';

// import {
//   LocalNotifications,
//   ScheduleOptions,
// } from '@capacitor/local-notifications';
import { BrandsAnagraphInterface } from 'src/app/interfaces/brands-anagraph';
import { BatteryTypeInterface } from 'src/app/interfaces/battery-type';
import { SettingsInterface } from 'src/app/interfaces/settings';

import { ModalController } from '@ionic/angular/standalone';
import { ModalResistanceLogsComponent } from '../modal/internal-resistance-logs.component';
import { ModalCyclesLogsComponent } from '../modal/cycles-logs.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { NotificationService } from 'src/app/services/notifications.service';
import { TokenService } from 'src/app/services/token.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-batteries-master',
  standalone: true,

  imports: [
    ReactiveFormsModule, FormsModule,
    JsonPipe,
    IonAlert,
    IonActionSheet,
    RouterLink,
    RouterOutlet,

    MatCardModule,
    MatButtonModule,
    MatDividerModule,

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
    IonToggle,
    IonToolbar,
  ],
  templateUrl: './master.component.html',
  styleUrl: './master.component.scss',
  providers: [
    ModalController
  ],
  animations: [
    trigger('bodyExpansion', [
      state('collapsed, void', style({ height: '0px', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition(
        'expanded <=> collapsed, void => collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
})
export class BatteriesMasterComponent {
  items: ExtendedBatteryAnagraphInterface[] = [];
  page = 'batteries';
  debug = true;
  batteryStatusActionEnum = batteryStatusActionEnum;
  state: string[] = [];

  extendedSeries: ExtendedSeriesAnagraph[] = [];
  toggle(id: number): void {
    this.state[id] = this.state[id] === 'collapsed' ? 'expanded' : 'collapsed';
  }
  showDismissedBatteries!: boolean;

  constructor(
    private db: DbService,
    private router: Router,
    private settings: SettingsService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    // private notificationService: NotificationService,
    // private tokenService: TokenService,
    // private messaging: AngularFireMessaging,
    // private authService: AuthService
    private platform: Platform
  ) {
    addIcons(ionIcons);
  }

  public async resetDatabase() {
    await this.db.deleteDb();
    await this.db.load();
    const forceLoading = true;
    await this.db.initService(forceLoading);
  }

  async ionViewWillEnter() {
    console.info('[PAGE]: Start');
    try {
      await this.db.load();
      const forceLoading = true;
      await this.db.initService(forceLoading);
    } catch (err) {
      console.error('[PAGE]: [DB]: Error during initialization:', err);
    }

    await this.getSettings();
    await this.getItems();

    this.setupLocalNotifications();
    // try {
    //   const alreadyAsked = localStorage.getItem(
    //     this.settings.getAppName() + '_requestNotificationsPermissions',
    //   );
    //   if (!alreadyAsked) {
    //     localStorage.setItem(
    //       this.settings.getAppName() + '_requestNotificationsPermissions',
    //       Date.now().toString(),
    //     );
    //     await this.presentAlert();
    //     await this.getItems();
    //     console.info('[PAGE]: [NOTIFICATIONS]: presentAlert');
    //   } else {
    //     await this.getItems();
    //     this.setupLocalNotifications();
    //     console.info(
    //       '[PAGE]: [NOTIFICATIONS]: Already granted, setupLocalNotifications',
    //     );
    //   }

      // const stored = await LocalNotifications.getPending();
      // console.info('[PAGE]: [stored NOTIFICATIONS]: ', stored);

      // LocalNotifications.addListener(
      //   'localNotificationReceived',
      //   (notification) => {
      //     console.log('Notification action received', notification);
      //   },
      // );
      // LocalNotifications.addListener(
      //   'localNotificationActionPerformed',
      //   (notification) => {
      //     console.log('Notification action received', notification);
      //   },
      // );
    // } catch (err) {
    //   console.error(
    //     '[PAGE]: [NOTIFICATIONS initialization]: Error during initialization:',
    //     err,
    //   );
    // }

    // this.sendNotification();
  }

  // requestPermission() {
  //   try{
  //     this.messaging.requestPermission.subscribe({
  //       next: () => {
  //         console.info('Notification permission granted.');

  //         this.messaging.getToken.subscribe({
  //           next: (token) => {
  //             console.info('FCM Token:', token);
  //             this.tokenService.setToken(token!);
  //           },
  //           error: (error) => {
  //             console.error('Error getting token:', error);
  //           }
  //         });
  //       },
  //       error: (error) => {
  //         console.error('Notification permission denied:', error);
  //       }
  //     });
  //   }catch(e){
  //     console.error(e)
  //   }
  // }

  // sendNotification() {

  //   this.authService.getUser().subscribe(user => {
  //     if (user) {
  //       const fcmToken = this.tokenService.getToken();
  //         if (fcmToken) {
  //           this.notificationService.sendNotificationToUser(fcmToken);
  //         } else {
  //           console.error('No FCM token available');
  //         }

  //     } else {
  //       // Prompt user to sign in
  //       this.authService.signIn().then(() => {
  //         // Once signed in, retrieve the FCM token
  //         const fcmToken = this.tokenService.getToken();
  //           if (fcmToken) {
  //             this.notificationService.sendNotificationToUser(fcmToken);
  //           } else {
  //             console.error('No FCM token available');
  //           }

  //       }).catch(error => {
  //         console.error('Authentication failed', error);
  //       });
  //     }
  //   });
  // }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Allow notifications',
      message: 'Do you want a reminder about your batteries status?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: async () => {
            // const granted = await LocalNotifications.requestPermissions();
            // if (granted.display === 'granted') {
            //   console.info('[PAGE]: [NOTIFICATIONS grant]: granted', granted);
            //   this.setupLocalNotifications();
            // } else {
            //   console.error(
            //     '[PAGE]: [NOTIFICATIONS grant]: not granted',
            //     granted,
            //   );
            // }
          },
        },
      ],
    });

    await alert.present();
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

  async toggleShowDismissedBatteries() {
    this.showDismissedBatteries = !this.showDismissedBatteries;
    const dbItem: SettingsInterface = {
      id: 1,
      showDismissedBatteries: this.showDismissedBatteries,
      enabled: +true,
      deleted: +false,
    };
    await this.db.putItem<SettingsInterface>('settings', dbItem);
    this.getItems();
  }

  getAge(age: Date, skipPostfix = false) {
    const differenceDays: number = differenceInDays(
      Date.now(),
      age?.getTime() as number,
    );

    const duration = intervalToDuration({ start: age, end: Date.now() });

    const format = formatDuration(
      duration ,
      { format: ['years', 'months', 'weeks', 'days'] },
    );
    return format + (format.length ?
      skipPostfix === false ? ' ago' : ''
      : '');
  }

  getBatteryDisabledTimeAgo(disabledDate: Date | null | undefined) {
    if(disabledDate){
      return this.getAge(disabledDate);
    } else return;
  }

  async getSettings() {
    try {
      const settings = await this.db.getItems<SettingsInterface>('settings');
      this.showDismissedBatteries = (settings[0].showDismissedBatteries ?? true);
    } catch (err) {
      console.error('[PAGE]: [DB]: Error during initialization:', err);
    }
  }

  async getItems() {
    try {
      let items: BatteryAnagraphInterface[];
      let column: string;
      let query;
      if(this.showDismissedBatteries) {
        column = 'deleted';
        query = [+false];
      } else {
        column = 'enabled, deleted';
        query = [+true, +false];
      }
      items = await this.db.getItems<BatteryAnagraphInterface>('batteries-anag',
        column,
        query,
      );

      const extendedSeries = await this.db.getItems<BatteryAnagraphInterface>('batteries-series');
      this.extendedSeries = extendedSeries;
      this.extendedSeries.forEach((series: ExtendedSeriesAnagraph) => {
        series.batteries = [];
      })

      // Sort items by id
      items.sort((a, b) => (a.id! > b.id! ? 1 : b.id! > a.id! ? -1 : 0));

      const objectStoreStatus = dbTables['batteries-status'];
      const objectStoreSeries = dbTables['batteries-series'];
      const objectStoreBrands = dbTables['brands-anag'];
      const objectStoreType = dbTables['batteries-types'];

      //const expandedItems: ExtendedBatteryAnagraphInterface[] = [];
      let platformWidth: number;
      let showExpand = false;
      this.platform.ready().then(async () => {
        platformWidth = this.platform.width();




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

              // Calculate timerange as the difference between the last status date and the current date
              const lastStatusTimeRange = differenceInDays(
                Date.now(),
                lastStatus?.date?.getTime() as number,
              );
              const lastStatusTimeAgo = this.getAge(lastStatus?.date!);
              const lessThanWarningRange =
                lastStatusTimeRange <= batteryStatusDaysAlertEnum.Warning;
              const lessThanDangergRange =
                lastStatusTimeRange <= batteryStatusDaysAlertEnum.Danger;
              const moreThanDangerRange =
                lastStatusTimeRange > batteryStatusDaysAlertEnum.Danger;
              const alertStatus =
                lastStatus?.status !== batteryStatusActionEnum.Store &&
                lessThanWarningRange
                  ? 'warning'
                  : (lastStatus?.status !== batteryStatusActionEnum.Store &&
                      lessThanDangergRange) || anag.enabled === 0
                    ? 'danger'
                    : lastStatus?.status !== batteryStatusActionEnum.Store &&
                        moreThanDangerRange
                      ? 'danger'
                      : 'success';

              // if (lastStatus?.status !== batteryStatusActionEnum.Store) {
              //   this.setupLocalNotification(anag, lastStatus!);
              // } else {
              //   LocalNotifications.cancel({
              //     notifications: [{ id: anag?.id! + 10 }, { id: anag?.id! + 20 }],
              //   });
              // }

              const expandedItem: ExtendedBatteryAnagraphInterface = {
                anag,
                lastStatus,
                series,
                totalCycles,
                lastStatusTimeAgo,
                lastStatusTimeRange,
                alertStatus,
                type,
                brand,
              };
              this.extendedSeries.find(el=>el.id === anag.seriesId)?.batteries?.push(expandedItem);

              // Add the expanded item to the array
              // expandedItems.push(expandedItem);


              if(platformWidth < 440){
                this.state[anag?.id!] = 'collapsed';
              }

            } catch (error) {
              console.error(`Error processing item with id ${anag.id}:`, error);
            }
          }

      });



      console.log(this.extendedSeries)
      // const stored = await LocalNotifications.getPending();
      // console.info('[PAGE]: stored notifications', stored);

      console.info('[PAGE]: Ready');
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }

  async showCycles(battery: ExtendedBatteryAnagraphInterface) {
    const modal = await this.modalCtrl.create({
      component: ModalCyclesLogsComponent,
      componentProps: {
        battery,
      },
    });
    modal.present();

    await modal.onWillDismiss();
  }

  async showLogs(battery: ExtendedBatteryAnagraphInterface) {
    const modal = await this.modalCtrl.create({
      component: ModalResistanceLogsComponent,
      componentProps: {
        battery,
      },
    });
    modal.present();
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

  async setupLocalNotifications() {
    console.info('[PAGE]: [setupLocalNotifications]');
    // const granted = await LocalNotifications.checkPermissions();
    // if (granted.display === 'granted') {
    // TODO remove old notifications

    this.items.map(async (el) => {
      const objectStoreStatus = dbTables['batteries-status'];
      const lastStatus: BatteryStatusInterface | undefined =
        await this.db.getLastStatusByDate<BatteryStatusInterface>(
          objectStoreStatus,
          el.anag.id!,
        );
      el.lastStatus = lastStatus;
      // const firstNotificationAt = new Date(
      //   new Date().getTime() +
      //     // batteryStatusDaysAlertEnum.Warning * 86_400 * 1000, // 3 * 86_400 seconds in a day * 1000
      //     batteryStatusDaysAlertEnum.Warning * 10 * 1000, // 30 sec
      // );
      const firstNotificationAt =
        batteryStatusDaysAlertEnum.Warning * 10 * 1000;
      const firstNotificationRange = 10;
      this.setLocalNotification(
        el.anag,
        el.lastStatus!,
        firstNotificationAt,
        firstNotificationRange,
      );
      // const secondNotificationAt = new Date(
      //   new Date().getTime() +
      //     batteryStatusDaysAlertEnum.Danger * 86_400 * 1000, // 5 * 86_400 seconds in a day * 1000
      // );
      const secondNotificationAt =
        batteryStatusDaysAlertEnum.Danger * 86_400 * 1000; // 5 * 86_400 seconds in a day * 1000

      const secondNotificationRange = 20;
      // this.setLocalNotification(
      //   el.anag,
      //   el.lastStatus!,
      //   secondNotificationAt,
      //   secondNotificationRange,
      // );
      // console.info('[PAGE]: [NOTIFICATIONS]: set', {
      //   anag: el.anag,
      //   lastStatus: el.lastStatus!,
      //   secondNotificationAt,
      //   secondNotificationRange,
      // });
    });
    // } else {
    //   console.error('[PAGE]: [NOTIFICATIONS]: not granted', granted);
    // }
  }

  async setNotification(at: number) {
    const anag = this.items[0].anag;
    const lastStatus = this.items[0].lastStatus!;
    const range = 90;
    console.info(
      '[PAGE]: [NOTIFICATIONS]: setLocalNotification',
      anag,
      lastStatus,
      at,
      range,
    );
    this.setLocalNotification(anag, lastStatus, at, range);
  }

  async setLocalNotification(
    anag: BatteryAnagraphInterface,
    lastStatus: BatteryStatusInterface,
    at: number,
    range: number,
  ) {
    const atTime = new Date(new Date().getTime() + at * 1000);
    const daysDifference = differenceInDays(atTime, lastStatus.date);

    // const notification: ScheduleOptions = {
    //   notifications: [
    //     {
    //       title: 'Battery ' + anag.label + ' Warning',
    //       body:
    //         'Battery ' +
    //         anag.label +
    //         ' has been ' +
    //         batteryStatusActionEnum[lastStatus.status!] +
    //         'd ' +
    //         daysDifference +
    //         ' days ago. Please put it in Storage to preserve battery life',
    //       id: anag?.id! + range,
    //       schedule: { at: atTime },
    //       actionTypeId: '',
    //       extra: null,
    //     },
    //   ],
    // };
    // await LocalNotifications.schedule(notification);
    // console.info('[PAGE]: set notification', notification);
  }
}
