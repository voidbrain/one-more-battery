import { Component } from '@angular/core'; // For root modules
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
  IonText,
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
  IonActionSheet,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonToggle,
  IonModal,
  IonDatetime,
  IonDatetimeButton,
} from '@ionic/angular/standalone';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DbService } from '../../../services/db.service';
import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';
import { batteryStatusActionEnum } from 'src/app/interfaces/battery-status';
import {
  BatteryAnagraphInterface,
  BatterySeriesAnagraphInterface,
  ExtendedBatteryAnagraphInterface,
} from 'src/app/interfaces/battery-anagraph';
import { BrandsAnagraphInterface } from 'src/app/interfaces/brands-anagraph';
import { DroneAnagraphInterface } from 'src/app/interfaces/drone-anagraph';
import { BatteryTypeInterface } from 'src/app/interfaces/battery-type';
import { dbTables, SettingsService } from 'src/app/services/settings.service';
import { FillDbService } from 'src/app/services/fillDb.service';
import { CommonModule } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-batteries-settings',
  standalone: true,
  imports: [
    NgxColorsModule,
    IonDatetimeButton,
    IonDatetime,
    IonModal,
    IonToggle,
    IonInput,
    RouterLink,
    RouterOutlet,
    DatePipe,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    IonCol,
    IonRow,
    IonGrid,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonActionSheet,
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
    IonText,
    IonToolbar,
    IonSelect,
    IonSelectOption,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  animations: [
    trigger('colorsAnimation', [
      state(
        'default',
        style({
          backgroundColor: 'blue',
        }),
      ),
      state(
        'highlighted',
        style({
          backgroundColor: 'yellow',
        }),
      ),
      transition('default <=> highlighted', [animate('0.5s')]),
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

  dateTimeFormatOptions = {
    date: {
      month: 'short',
      day: '2-digit',
    },
  };

  newAnagForm: BatteryAnagraphInterface = {
    enabled: +true,
    deleted: +false,
    mA: 0,
    label: '',
    seriesId: 0,
    date: new Date(),
    brandId: undefined,
    typeId: undefined,
    model: undefined,
    cellsNumber: undefined,
    dateString: undefined,
  };
  newBatteryForm: ExtendedBatteryAnagraphInterface = {
    anag: this.newAnagForm,
  };

  newBrandForm: BrandsAnagraphInterface = {
    label: '',
    enabled: +true,
    deleted: +false,
  };

  newTypeForm: BatteryTypeInterface = {
    label: '',
    enabled: +true,
    deleted: +false,
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

  public async resetDatabase() {
    await this.db.deleteDb();
    await this.db.load();
    const forceLoading = true;
    await this.db.initService(forceLoading);
  }

  public async fillDatabase() {
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

      await this.getItems();
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  }

  get getColor(): string | undefined {
    return this.series?.find(
      (el) => el.id === this.newBatteryForm?.anag?.seriesId,
    )?.color;
  }

  async addBattery() {
    const objectStore = dbTables['batteries-anag'];
    this.newAnagForm.date = new Date(this.newAnagForm.date);
    this.newAnagForm.dateString = this.newAnagForm.date.toISOString();
    await this.db.putItem(objectStore, this.newAnagForm);
    this.newAnagForm = {
      enabled: +true,
      deleted: +false,
      mA: 0,
      label: '',
      seriesId: 0,
      date: new Date(),
      brandId: undefined,
      typeId: undefined,
      model: undefined,
      cellsNumber: undefined,
      dateString: undefined,
    };
    this.newBatteryForm = {
      anag: this.newAnagForm,
      brand: undefined,
      series: undefined,
      type: undefined,
    };
    this.getItems();
  }

  async addBrand() {
    const objectStore = dbTables['brands-anag'];
    await this.db.putItem(objectStore, this.newBrandForm);
    this.newBrandForm = {
      label: '',
      enabled: +true,
      deleted: +false,
    };
    this.getItems();
  }

  async addType() {
    const objectStore = dbTables['batteries-types'];
    await this.db.putItem(objectStore, this.newTypeForm);
    this.newTypeForm = {
      label: '',
      enabled: +true,
      deleted: +false,
    };
    this.getItems();
  }

  async addSeries() {
    const objectStore = dbTables['batteries-series'];
    await this.db.putItem(objectStore, this.newSeriesForm);
    this.newSeriesForm = {
      label: '',
      enabled: +true,
      deleted: +false,
      color: '',
    };
    this.getItems();
  }

  changeColor(value: string, el: any, forwardToDb: boolean) {
    el.color = value;
    if (forwardToDb) {
      this.updateRowSeries(el);
    }
  }

  deleteAnagItem(anag: BatteryAnagraphInterface) {
    anag.deleted = +true;
    const forwardToDb = true;
    this.updateRowAnag(anag, forwardToDb);
  }

  deleteBrandsItem(el: BrandsAnagraphInterface) {
    el.deleted = +true;
    this.updateRowBrands(el);
  }

  deleteSeriesItem(el: BatterySeriesAnagraphInterface) {
    el.deleted = +true;
    this.updateRowSeries(el);
  }

  deleteTypesItem(el: BatteryTypeInterface) {
    el.deleted = +true;
    this.updateRowTypes(el);
  }

  async updateElement<T>(
    e: ExtendedBatteryAnagraphInterface,
    value: number | string,
    property: keyof BatteryAnagraphInterface,
  ): Promise<T | undefined> {
    try {
      if (property in e.anag) {
        // Update the property
        (e.anag as any)[property] = value;

        // Wait for updateRowAnag to complete
        const forwardToDb = true;
        await this.updateRowAnag(
          e.anag as BatteryAnagraphInterface,
          forwardToDb,
        );

        return e as unknown as T;
      } else {
        throw new Error(
          `Property '${property}' does not exist in BatteryAnagraphInterface.`,
        );
      }
    } catch (error) {
      console.error('Error updating element:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }

  async getItems() {
    try {
      const objectStoreSeries = dbTables['batteries-series'];
      const objectStoreTypes = dbTables['batteries-types'];
      const objectStoreBrands = dbTables['brands-anag'];
      const objectStoreBatteries = dbTables['batteries-anag'];
      const objectStoreDrones = dbTables['drones-anag'];
      const column = 'deleted';
      const query = [+false];
      // Fetch the data
      const anagArr: BatteryAnagraphInterface[] =
        await this.db.getItems<BatteryAnagraphInterface>(objectStoreBatteries, column, query);
      const series: BatterySeriesAnagraphInterface[] =
        await this.db.getItems<BatterySeriesAnagraphInterface>(objectStoreSeries, column, query);
      const types: BatteryTypeInterface[] =
        await this.db.getItems<BatteryTypeInterface>(objectStoreTypes, column, query);
      const brands: BrandsAnagraphInterface[] =
        await this.db.getItems<BrandsAnagraphInterface>(objectStoreBrands, column, query);
      const dronesAnagArr: DroneAnagraphInterface[] =
        await this.db.getItems<DroneAnagraphInterface>(objectStoreDrones, column, query);

      // Create a map to keep track of batteries by ID for faster lookup
      const batteryMap: Map<number, ExtendedBatteryAnagraphInterface> =
        new Map();

      for (const anag of anagArr) {
        // Check if the record is marked as deleted
        if (anag.deleted === 1) {
          // Remove the deleted battery from the array if it exists
          this.batteries = this.batteries.filter(
            (battery) => battery.anag.id !== anag.id,
          );
          continue;
        }
        anag.dateString = anag.date.toISOString();

        // Fetch series, type, and brand asynchronously
        const batterySeries: BatterySeriesAnagraphInterface | undefined =
          await this.db.getItem<BatterySeriesAnagraphInterface>(
            objectStoreSeries,
            anag.seriesId,
            'id',
          );
        const batteryType: BatteryTypeInterface | undefined =
          await this.db.getItem<BatteryTypeInterface>(
            objectStoreTypes,
            anag.typeId!,
            'id',
          );
        const batteryBrand: BrandsAnagraphInterface | undefined =
          await this.db.getItem<BrandsAnagraphInterface>(
            objectStoreBrands,
            anag.brandId!,
            'id',
          );

        // Create the new extended battery object
        const extendedBattery: ExtendedBatteryAnagraphInterface = {
          anag,
          series: batterySeries,
          type: batteryType,
          brand: batteryBrand,
        };

        // Add to the map
        batteryMap.set(anag.id!, extendedBattery);
      }

      // Convert the map to an array
      const updatedBatteries = Array.from(batteryMap.values());

      // Update the batteries array if there is a change
      if (JSON.stringify(this.batteries) !== JSON.stringify(updatedBatteries)) {
        this.batteries = updatedBatteries;
      }

      // Assign to class properties only if needed
      if (JSON.stringify(this.series) !== JSON.stringify(series))
        this.series = series;
      if (JSON.stringify(this.types) !== JSON.stringify(types))
        this.types = types;
      if (JSON.stringify(this.brands) !== JSON.stringify(brands))
        this.brands = brands;

      console.info('[PAGE]: Ready');
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }

  get newBatteryFormAddDisabled() {
    return (
      !this.newBatteryForm.anag.label ||
      this.newBatteryForm.anag.label === '' ||
      !this.newBatteryForm.anag?.typeId ||
      !this.newBatteryForm.anag?.brandId
    );
  }

  async setRowAnag<T>(
    anag: BatteryAnagraphInterface,
    value: number | string | string[],
    property: keyof BatteryAnagraphInterface,
  ): Promise<T | undefined> {
    try {
      if (property in anag) {
        // Update the property
        (anag as any)[property] = value;
        // Wait for updateRowAnag to complete
        if (property === 'dateString') {
          anag.date = new Date(anag.dateString!);
        }

        return anag as T;
      } else {
        throw new Error(
          `Property '${property}' does not exist in BatteryAnagraphInterface.`,
        );
      }
    } catch (error) {
      console.error('Error updating element:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }

  async setNewBatteryElement<T>(
    e: ExtendedBatteryAnagraphInterface,
    value: number | string,
    property: keyof BatteryAnagraphInterface,
  ): Promise<T | undefined> {
    try {
      if (property in e.anag) {
        // Update the property
        (e.anag as any)[property] = value;
        // Wait for updateRowAnag to complete

        return e as T;
      } else {
        throw new Error(
          `Property '${property}' does not exist in BatteryAnagraphInterface.`,
        );
      }
    } catch (error) {
      console.error('Error updating element:', error);
      throw error; // Re-throw the error to be caught by the caller
    }
  }

  async updateRowAnag(el: BatteryAnagraphInterface, forwardToDb: boolean) {
    const objectStore: string = dbTables['batteries-anag'];
    el.date = new Date(el.dateString!);
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;
    if (forwardToDb) {
      this.db.putItem(objectStore, el);
    }
    await this.getItems();
  }

  async updateRowSeries(el: BatterySeriesAnagraphInterface) {
    const objectStore: string = dbTables['batteries-series'];
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;
    this.db.putItem(objectStore, el);
    await this.getItems();
  }

  async updateRowBrands(el: BrandsAnagraphInterface) {
    const objectStore: string = dbTables['brands-anag'];
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;
    this.db.putItem(objectStore, el);
    await this.getItems();
  }

  async updateRowTypes(el: BatteryTypeInterface) {
    const objectStore: string = dbTables['batteries-types'];
    el.enabled = +el.enabled;
    el.deleted = +el.deleted;
    this.db.putItem(objectStore, el);
    await this.getItems();
  }
}
