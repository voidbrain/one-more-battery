import { Injectable } from '@angular/core';
import {
  BatteryAnagraphInterface,
  BatterySeriesAnagraphInterface,
} from '../interfaces/battery-anagraph';
import { BatteryResistanceLogInterface } from '../interfaces/battery-resistance';
import { BatteryTypeInterface } from '../interfaces/battery-type';
import {
  batteryStatusActionEnum,
  BatteryStatusInterface,
} from '../interfaces/battery-status';
import { BrandsAnagraphInterface } from '../interfaces/brands-anagraph';
import { DbService } from './db.service';
import { dbTables } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class FillDbService {
  constructor(private db: DbService) {}

  public fillDb() {
    console.info('[DB]: fill Db');
    const itemBatteryType: BatteryTypeInterface = {
      enabled: +true,
      deleted: +false,
      label: 'LiPo',
    };
    this.db.putItem(dbTables['batteries-types'], itemBatteryType);

    /**
     * Resistance Logs
     */

    const itemBatteryResistanceLogs1: BatteryResistanceLogInterface = {
      idBattery: 1,
      enabled: +true,
      deleted: +false,
      date: new Date('2024-08-15'),
      values: [4.3, 3.5, 4.3, 5.0, 4.3, 4.3],
    };
    this.db.putItem(
      dbTables['batteries-resistance-logs'],
      itemBatteryResistanceLogs1,
    );
    const itemBatteryResistanceLogs2: BatteryResistanceLogInterface = {
      idBattery: 2,
      enabled: +true,
      deleted: +false,
      date: new Date('2024-08-15'),
      values: [4.2, 4.2, 5.6, 4.2, 3.5, 4.2],
    };
    this.db.putItem(
      dbTables['batteries-resistance-logs'],
      itemBatteryResistanceLogs2,
    );
    const itemBatteryResistanceLogs3: BatteryResistanceLogInterface = {
      idBattery: 3,
      enabled: +true,
      deleted: +false,
      date: new Date('2024-08-15'),
      values: [5.7, 5.0, 5.0, 5.0, 5.0, 5.0],
    };
    this.db.putItem(
      dbTables['batteries-resistance-logs'],
      itemBatteryResistanceLogs3,
    );
    const itemBatteryResistanceLogs4: BatteryResistanceLogInterface = {
      idBattery: 4,
      enabled: +true,
      deleted: +false,
      date: new Date('2024-08-15'),
      values: [3.5, 4.2, 3.5, 3.5, 4.2, 4.2],
    };
    this.db.putItem(
      dbTables['batteries-resistance-logs'],
      itemBatteryResistanceLogs4,
    );

    /**
     * Series anag
     */

    let itemBatterySeries: BatterySeriesAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      label: '',
      color: '',
    };
    this.db.putItem(dbTables['batteries-series'], itemBatterySeries);

    itemBatterySeries = {
      enabled: +true,
      deleted: +false,
      label: 'Yellow',
      color: '#e0d207',
    };
    this.db.putItem(dbTables['batteries-series'], itemBatterySeries);

    /**
     * Brands anag
     */

    const itemBrand: BrandsAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      label: 'Tattu',
    };
    this.db.putItem(dbTables['brands-anag'], itemBrand);

    /**
     * Batteries anag
     */

    const b1: BatteryAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2024-08-15'),
      typeId: 1,
      model: 'R-line',
      mA: 1400,
      brandId: 1,
      seriesId: 1,
      label: '1',
    };
    this.db.putItem(dbTables['batteries-anag'], b1);
    const b2: BatteryAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2024-08-15'),
      typeId: 1,
      model: 'R-line',
      mA: 1400,
      brandId: 1,
      seriesId: 1,
      label: '2',
    };
    this.db.putItem(dbTables['batteries-anag'], b2);
    const b3: BatteryAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2024-08-15'),
      typeId: 1,
      model: 'R-line',
      mA: 1400,
      brandId: 1,
      seriesId: 1,
      label: '3',
    };
    this.db.putItem(dbTables['batteries-anag'], b3);
    const b4: BatteryAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2024-08-15'),
      typeId: 1,
      model: 'R-line',
      mA: 1400,
      brandId: 1,
      seriesId: 1,
      label: '4',
    };
    this.db.putItem(dbTables['batteries-anag'], b4);

    /**
     * Brands status logs
     */

    let itemStatus1: BatteryStatusInterface = {
      idBattery: 1,
      date: new Date('2024-08-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-14'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-14'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    let itemStatus2: BatteryStatusInterface = {
      idBattery: 2,
      date: new Date('2024-08-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-14'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-14'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    let itemStatus3: BatteryStatusInterface = {
      idBattery: 3,
      date: new Date('2024-08-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-14'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    let itemStatus4: BatteryStatusInterface = {
      idBattery: 4,
      date: new Date('2024-08-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-15'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-15'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-15'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-18'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-18'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-17'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-18'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-18'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-17'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-18'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-18'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-25'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-25'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-26'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-26'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-25'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-25'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-25'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-25'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-28'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-28'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-31'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-31'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-31'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-31'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-08-31'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-08-31'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-08-31'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-08-31'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-01'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-07'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-08'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-08'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-08'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-08'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-08'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-08'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-08'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-08'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-14'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-14'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-15'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-15'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-15'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-15'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-17'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-17'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-17'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-17'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-20'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-20'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-20'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-20'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-20'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-20'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-20'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-20'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-21'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-28'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-09-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-09-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-30'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-30'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-09-30'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-09-30'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-01'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-01'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-01'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-01'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-05'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-06'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-07'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-07'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-12'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-12'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-13'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-13'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-13'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-13'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-13'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-13'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-13'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-13'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-17'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-20'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-10-27'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-03'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-03'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-03'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-03'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-04'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-04'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-04'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-04'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-09'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-09'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-09'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-09'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-09'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-09'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-10'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-11'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-17'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-17'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-17'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-17'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-21'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-21'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-21'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-21'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-23'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-23'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-23'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-23'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-23'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-23'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus3 = {
      idBattery: 3,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus3);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-11-30'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    // last update 2024-11-30

    console.info('[DB]: fill Db finish');
  }
}
