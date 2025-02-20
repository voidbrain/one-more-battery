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
import { SettingsInterface } from '../interfaces/settings';

@Injectable({
  providedIn: 'root',
})
export class FillDbService {
  constructor(private db: DbService) {}

  public fillDb() {
    console.info('[DB]: fill Db');

    const settings: SettingsInterface = {
      id: 1,
      enabled: +true,
      deleted: +false,
      showDismissedBatteries: true
    };
    this.db.putItem(
      dbTables['settings'],
      settings,
    );

    const itemBatteryTypeLipo: BatteryTypeInterface = {
      enabled: +true,
      deleted: +false,
      label: 'LiPo',
    };
    this.db.putItem(dbTables['batteries-types'], itemBatteryTypeLipo);

    const itemBatteryTypeLiHv: BatteryTypeInterface = {
      enabled: +true,
      deleted: +false,
      label: 'LiHV',
    };
    this.db.putItem(dbTables['batteries-types'], itemBatteryTypeLiHv);

    /**
     * Resistance Logs
     */

    let itemBatteryResistanceLogs1: BatteryResistanceLogInterface = {
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
    itemBatteryResistanceLogs1 = {
      idBattery: 1,
      enabled: +true,
      deleted: +false,
      date: new Date('2025-01-12'),
      values: [4.9, 5.4, 6.3, 5.8, 5.4, 5.8],
    };
    this.db.putItem(
      dbTables['batteries-resistance-logs'],
      itemBatteryResistanceLogs1,
    );
    let itemBatteryResistanceLogs2: BatteryResistanceLogInterface = {
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
    itemBatteryResistanceLogs2 = {
      idBattery: 2,
      enabled: +true,
      deleted: +false,
      date: new Date('2025-01-12'),
      values: [4.9, 4.9, 4.9, 5.4, 5.4, 5.9],
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
    let itemBatteryResistanceLogs4: BatteryResistanceLogInterface = {
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
    itemBatteryResistanceLogs4 = {
      idBattery: 4,
      enabled: +true,
      deleted: +false,
      date: new Date('2025-01-12'),
      values: [4.9, 5.9, 5.9, 4.9, 5.9, 5.9],
    };
    this.db.putItem(
      dbTables['batteries-resistance-logs'],
      itemBatteryResistanceLogs4,
    );

    const itemBatteryResistanceLogs5: BatteryResistanceLogInterface = {
      idBattery: 5,
      enabled: +true,
      deleted: +false,
      date: new Date('2025-01-12'),
      values: [12, 12, 12, 12, 11, 12],
    };
    this.db.putItem(
      dbTables['batteries-resistance-logs'],
      itemBatteryResistanceLogs5,
    );

    const itemBatteryResistanceLogs6: BatteryResistanceLogInterface = {
      idBattery: 6,
      enabled: +true,
      deleted: +false,
      date: new Date('2025-01-12'),
      values: [12, 12, 12, 12, 12, 12],
    };
    this.db.putItem(
      dbTables['batteries-resistance-logs'],
      itemBatteryResistanceLogs6,
    );

    /**
     * Series anag
     */

    let itemBatterySeries: BatterySeriesAnagraphInterface = {
      id: 1,
      enabled: +true,
      deleted: +false,
      label: 'Yellow',
      color: '#e0d207',
    };
    this.db.putItem(dbTables['batteries-series'], itemBatterySeries);

    itemBatterySeries = {
      id:2,
      enabled: +true,
      deleted: +false,
      label: 'Blue',
      color: '#00f',
    };
    this.db.putItem(dbTables['batteries-series'], itemBatterySeries);

    /**
     * Brands anag
     */

    const itemBrandTattu: BrandsAnagraphInterface = {
      id: 1,
      enabled: +true,
      deleted: +false,
      label: 'Tattu',
    };
    this.db.putItem(dbTables['brands-anag'], itemBrandTattu);

    const itemBrandGaoneng: BrandsAnagraphInterface = {
      id: 2,
      enabled: +true,
      deleted: +false,
      label: 'Gaoneng',
    };
    this.db.putItem(dbTables['brands-anag'], itemBrandGaoneng);

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
      enabled: +false,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2024-08-15'),
      disabledDate: new Date('2024-11-30'),
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

    ////

    const b5: BatteryAnagraphInterface = {
      enabled: +false,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2024-12-29'),
      typeId: 2,
      model: 'GNB',
      mA: 1300,
      brandId: 2,
      seriesId: 2,
      label: '1',
    };
    this.db.putItem(dbTables['batteries-anag'], b5);

    const b6: BatteryAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2024-12-29'),
      typeId: 2,
      model: 'GNB',
      mA: 1300,
      brandId: 2,
      seriesId: 2,
      label: '2',
    };
    this.db.putItem(dbTables['batteries-anag'], b6);

    const b7: BatteryAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2025-01-12'),

      typeId: 1,
      model: 'R-line',
      mA: 1400,
      brandId: 1,
      seriesId: 1,
      label: '5',
    };
    this.db.putItem(dbTables['batteries-anag'], b7);

    const b8: BatteryAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2025-01-12'),

      typeId: 1,
      model: 'R-line',
      mA: 1400,
      brandId: 1,
      seriesId: 1,
      label: '6',
    };
    this.db.putItem(dbTables['batteries-anag'], b8);

    const b9: BatteryAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2025-01-12'),

      typeId: 1,
      model: 'R-line',
      mA: 1400,
      brandId: 1,
      seriesId: 1,
      label: '7',
    };
    this.db.putItem(dbTables['batteries-anag'], b9);

    const b10: BatteryAnagraphInterface = {
      enabled: +true,
      deleted: +false,
      cellsNumber: 6,
      date: new Date('2025-01-12'),

      typeId: 1,
      model: 'R-line',
      mA: 1400,
      brandId: 1,
      seriesId: 1,
      label: '8',
    };
    this.db.putItem(dbTables['batteries-anag'], b10);

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

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-12-24'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-12-24'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-12-24'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-12-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-12-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-12-24'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-12-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-12-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-12-24'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-12-29'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-12-29'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-12-29'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-12-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-12-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    let itemStatus5: BatteryStatusInterface = {
      idBattery: 5,
      date: new Date('2024-12-29'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2024-12-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2024-12-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    let itemStatus6 = {
      idBattery: 6,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2024-12-31'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-02'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-04'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-04'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-04'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-04'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-04'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-04'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-04'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-06'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-06'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2025-01-06'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2025-01-06'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-01-06'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-01-06'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-01-12'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-19'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-19'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-19'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2025-01-19'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-01-19'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-21'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-25'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-25'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-25'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-25'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus5 = {
      idBattery: 5,
      date: new Date('2025-01-25'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus5);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-01-25'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-26'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-26'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-26'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-26'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-26'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-01-26'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-01-26'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-29'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };

    this.db.putItem(dbTables['batteries-status'], itemStatus2);
    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-01-29'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-02'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-02'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-02-02'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-02-02'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-04'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-04'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-02-05'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-02-05'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-05'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-05'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-02-05'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-02-05'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-08'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-08'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-02-08'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-02-08'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-09'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-09'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-02-09'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-02-09'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-09'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-09'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-02-09'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-02-09'),
      status: batteryStatusActionEnum.Store,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-02-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-02-14'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-15'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-15'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-16'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-16'),
      status: batteryStatusActionEnum.Charge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus1 = {
      idBattery: 1,
      date: new Date('2025-02-18'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus1);

    itemStatus2 = {
      idBattery: 2,
      date: new Date('2025-02-18'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus2);

    itemStatus4 = {
      idBattery: 4,
      date: new Date('2025-02-19'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus4);

    itemStatus6 = {
      idBattery: 6,
      date: new Date('2025-02-20'),
      status: batteryStatusActionEnum.Discharge,
      enabled: +true,
      deleted: +false,
    };
    this.db.putItem(dbTables['batteries-status'], itemStatus6);

    console.info('[DB]: fill Db finish');

    // last update 2025-02-20
  }
}
