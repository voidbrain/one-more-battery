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
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db.service';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { BatteryStatusInterface } from 'src/app/interfaces/battery-status';
import { DemoDbService } from 'src/app/services/demoDb.service';
import { BatteryAnagraphInterface, ExtendedBatteryAnagraphInterface } from 'src/app/interfaces/battery-anagraph';

@Component({
  selector: 'app-batteries-master',
  standalone: true,
  imports: [
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

  constructor(
    private db: DbService,
    private router: Router,
    private demoDb: DemoDbService
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


      // this.demoDb.demoDb();

    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  async getItems() {
    try {
      const items: BatteryAnagraphInterface[] = (await this.db.getItems('batteries-anag')) as BatteryAnagraphInterface[];
      items.sort((a, b) => (a.id! > b.id! ? 1 : b.id! > a.id! ? -1 : 0));

      items.forEach(async (item) => {
        const lastStatus: BatteryStatusInterface = await this.db.getLastOrderByDate("batteries-status") as BatteryStatusInterface;
        const series: BatteryAnagraphInterface = await this.db.getItem("batteries-series", item.seriesId) as BatteryAnagraphInterface;
        const newObj: ExtendedBatteryAnagraphInterface = {...item, lastStatus, series };
        this.items.push(newObj)
      });

      console.log(this.items)
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
