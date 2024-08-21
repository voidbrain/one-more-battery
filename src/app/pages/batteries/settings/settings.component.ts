import { Component, ViewChildren } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
  IonSelect,
  IonSelectOption,
  RefresherCustomEvent, IonActionSheet, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonInput, IonToggle, IonModal, IonDatetime, IonDatetimeButton } from '@ionic/angular/standalone';
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
  imports: [IonDatetimeButton, IonDatetime, IonModal, IonToggle, IonInput, 
    RouterLink,
    RouterOutlet,
    DatePipe,
    ReactiveFormsModule, FormsModule,

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
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class BatteriesSettingComponent {
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

  async updateElement<T>(
    e: ExtendedBatteryAnagraphInterface,
    value: number,
    property: keyof BatteryAnagraphInterface
  ): Promise<T | undefined> {
    return new Promise<T | undefined>((resolve, reject) => {
      try {
        // Check if 'property' is a key in BatteryAnagraphInterface
        if (property in e.anag) {
          // Ensure the property is of type number
          if (typeof e.anag[property] === 'number') {
            (e.anag as any)[property] = value; // Use 'as any' to bypass TypeScript errors
            resolve(e as unknown as T);
          } else {
            reject(new Error(`Property '${property}' is not of type number.`));
          }
        } else {
          reject(new Error(`Property '${property}' does not exist in BatteryAnagraphInterface.`));
        }
      } catch (error) {
        console.error('Error updating element:', error);
        reject(error);
      }
    });
  }

  async getItems() {
    try {
      const objectStoreSeries = "batteries-series"; 
      const objectStoreTypes = "batteries-types";
      const objectStoreBrands = "brands-anag";
      const objectStoreBatteries = "batteries-anag";
      const series: BatterySeriesAnagraphInterface[] = await this.db.getItems<BatterySeriesAnagraphInterface>(objectStoreSeries, 'id', []);
      const anagArr: BatteryAnagraphInterface[] = await this.db.getItems<BatteryAnagraphInterface>(objectStoreBatteries, 'id', []);
      const types: BatteryTypeInterface[] = await this.db.getItems<BatteryTypeInterface>(objectStoreTypes, 'id', []);
      const brands: BrandsAnagraphInterface[] = await this.db.getItems<BrandsAnagraphInterface>(objectStoreBrands, 'id', []);
      const batteries: ExtendedBatteryAnagraphInterface[] = [];

      anagArr.map(async anag => {
        anag.dateString = anag.date.toISOString();
        const batterySeries: BatteryAnagraphInterface | undefined = await this.db.getItem<BatteryAnagraphInterface>(objectStoreSeries, anag.seriesId, 'id');
        const batteryType: BatteryTypeInterface | undefined = await this.db.getItem<BatteryTypeInterface>(objectStoreTypes, anag.typeId!, 'id');
        const batteryBrand: BrandsAnagraphInterface | undefined = await this.db.getItem<BrandsAnagraphInterface>(objectStoreBrands, anag.brandId!, 'id');

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
  
  async updateRowAnag(el: BatteryAnagraphInterface){
    const objectStore: string = 'batteries-anag';
    el.date = new Date(el.dateString!);
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;
    this.db.putItem(objectStore, el);
    await this.getItems()
  }

  async updateRowSeries(el: BatterySeriesAnagraphInterface){
    const objectStore: string = 'batteries-series';
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;
    this.db.putItem(objectStore, el);
    await this.getItems()
  }

  async updateRowBrands(el: BrandsAnagraphInterface){
    const objectStore: string = 'brands-anag';
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;    
    this.db.putItem(objectStore, el);
    await this.getItems()
  }

  async updateRowTypes(el: BatteryTypeInterface){
    const objectStore: string = 'batteries-types';
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;    
    this.db.putItem(objectStore, el);
    await this.getItems()
  }
}
