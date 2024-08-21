import { Component } from '@angular/core';  // For root modules
import { NgxColorsModule } from 'ngx-colors';
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
  IonActionSheet, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol, IonInput, IonToggle, IonModal, IonDatetime, IonDatetimeButton } from '@ionic/angular/standalone';
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
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-batteries-settings',
  standalone: true,
  imports: [
    NgxColorsModule,
    IonDatetimeButton, IonDatetime, IonModal, IonToggle, IonInput,
    RouterLink,
    RouterOutlet,
    DatePipe,
    ReactiveFormsModule, FormsModule,
    CommonModule,
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
  animations: [
    trigger('colorsAnimation', [
      state('default', style({
        backgroundColor: 'blue'
      })),
      state('highlighted', style({
        backgroundColor: 'yellow'
      })),
      transition('default <=> highlighted', [
        animate('0.5s')
      ])
    ]),
  ],
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

  newBrandForm: BrandsAnagraphInterface = {
    label: '',
    enabled: +true,
    deleted: +false
  };

  newTypeForm: BatteryTypeInterface = {
    label: '',
    enabled: +true,
    deleted: +false
  };

  newSeriesForm: BatterySeriesAnagraphInterface = {
    label: '',
    enabled: +true,
    deleted: +false,
    color: '',
  };

  constructor(
    private db: DbService,
    private settings: SettingsService,
    private fillDb: FillDbService,
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

  async addBrand(){
    const objectStore = "brands-anag";
    await this.db.putItem(objectStore, this.newBrandForm);
    this.newBrandForm = {
      label: '',
      enabled: +true,
      deleted: +false,
    };
    this.getItems();
  }

  async addType(){
    const objectStore = "batteries-types";
    await this.db.putItem(objectStore, this.newTypeForm);
    this.newTypeForm = {
      label: '',
      enabled: +true,
      deleted: +false,
    };
    this.getItems();
  }

  async addSeries(){
    const objectStore = "batteries-series";
    await this.db.putItem(objectStore, this.newSeriesForm);
    this.newSeriesForm = {
      label: '',
      enabled: +true,
      deleted: +false,
      color: ''
    };
    this.getItems();
  }

  changeColor(value: string, el: any, forwardToDb: boolean){
    el.color = value;
    if(forwardToDb){
      this.updateRowSeries(el);
    }
  }

  async updateElement<T>(
    e: ExtendedBatteryAnagraphInterface,
    value: number,
    property: keyof BatteryAnagraphInterface
  ): Promise<T | undefined> {
    try {
      if (property in e.anag) {
        // Update the property
        (e.anag as any)[property] = value;

        // Wait for updateRowAnag to complete
        await this.updateRowAnag(e.anag as BatteryAnagraphInterface);

        return e as unknown as T;
      } else {
        throw new Error(`Property '${property}' does not exist in BatteryAnagraphInterface.`);
      }
    } catch (error) {
      console.error('Error updating element:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }

  async getItems() {
    try {
      const objectStoreSeries = "batteries-series";
      const objectStoreTypes = "batteries-types";
      const objectStoreBrands = "brands-anag";
      const objectStoreBatteries = "batteries-anag";

      // Fetch the data
      const series: BatterySeriesAnagraphInterface[] = await this.db.getItems<BatterySeriesAnagraphInterface>(objectStoreSeries, 'id', []);
      const anagArr: BatteryAnagraphInterface[] = await this.db.getItems<BatteryAnagraphInterface>(objectStoreBatteries, 'id', []);
      const types: BatteryTypeInterface[] = await this.db.getItems<BatteryTypeInterface>(objectStoreTypes, 'id', []);
      const brands: BrandsAnagraphInterface[] = await this.db.getItems<BrandsAnagraphInterface>(objectStoreBrands, 'id', []);

      const batteries: ExtendedBatteryAnagraphInterface[] = [];

      // Use for...of for async operations
      for (const anag of anagArr) {
        anag.dateString = anag.date.toISOString();

        // Fetch series, type, and brand asynchronously
        const batterySeries: BatteryAnagraphInterface | undefined = await this.db.getItem<BatteryAnagraphInterface>(objectStoreSeries, anag.seriesId, 'id');
        const batteryType: BatteryTypeInterface | undefined = await this.db.getItem<BatteryTypeInterface>(objectStoreTypes, anag.typeId!, 'id');
        const batteryBrand: BrandsAnagraphInterface | undefined = await this.db.getItem<BrandsAnagraphInterface>(objectStoreBrands, anag.brandId!, 'id');

        // Create the new extended battery object
        const extendedBattery: ExtendedBatteryAnagraphInterface = {
          anag,
          series: batterySeries,
          type: batteryType,
          brand: batteryBrand,
        };

        // Check if the current battery needs to be updated
        const existingBattery = this.batteries.find(battery => battery.anag.id === anag.id);

        // Perform deep comparison (this can be more complex depending on your object structure)
        const hasChanged = !existingBattery || JSON.stringify(existingBattery) !== JSON.stringify(extendedBattery);

        if (hasChanged) {
          // Update the batteries array if there is a change
          const index = this.batteries.findIndex(battery => battery.anag.id === anag.id);
          if (index !== -1) {
            this.batteries[index] = extendedBattery;
          } else {
            this.batteries.push(extendedBattery);
          }
        }
      }
      console.log(this.batteries)
      // Assign to class properties only if needed
      if (JSON.stringify(this.series) !== JSON.stringify(series)) this.series = series;
      if (JSON.stringify(this.types) !== JSON.stringify(types)) this.types = types;
      if (JSON.stringify(this.brands) !== JSON.stringify(brands)) this.brands = brands;

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
