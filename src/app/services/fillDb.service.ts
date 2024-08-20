import { Injectable } from '@angular/core';
import { BatteryAnagraphInterface, BatterySeriesAnagraphInterface } from '../interfaces/battery-anagraph';
import { BatteryTypeInterface } from '../interfaces/battery-type';
import { batteryStatusActionEnum, BatteryStatusInterface } from '../interfaces/battery-status';
import { BrandsAnagraphInterface } from '../interfaces/brands-anagraph';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class FillDbService {

  constructor(
    private db: DbService
  ){

  }

  public fillDb (){
    console.log('[DB]: fill Db');
    const itemBatteryType: BatteryTypeInterface =
        {
          enabled: +true,
          deleted: +false,
          label: "LiPo"
        }
      this.db.putItem('batteries-types', itemBatteryType);

      let itemBatterySeries: BatterySeriesAnagraphInterface =
      {
        enabled: +true,
        deleted: +false,
        label: "",
        color: "",
      }
    this.db.putItem('batteries-series', itemBatterySeries);

    itemBatterySeries =
      {
        enabled: +true,
        deleted: +false,
        label: "Yellow",
        color: "#e0d207"
      }
    this.db.putItem('batteries-series', itemBatterySeries);

    const itemBrand: BrandsAnagraphInterface =
        {
          enabled: +true,
          deleted: +false,
          label: "Tattu"
        }
      this.db.putItem('brands-anag', itemBrand);

      const b1: BatteryAnagraphInterface =
        {
          enabled: +true,
          deleted: +false,
          cellsNumber: 6,
          typeId: 1,
          model: "R-line",
          brandId: 1,
          seriesId: 1,
          label: '1'
        }
      this.db.putItem('batteries-anag', b1);
      const b2: BatteryAnagraphInterface =
        {
          enabled: +true,
          deleted: +false,
          cellsNumber: 6,
          typeId: 1,
          model: "R-line",
          brandId: 1,
          seriesId: 1,
          label: '2'
        }
      this.db.putItem('batteries-anag', b2);
      const b3: BatteryAnagraphInterface =
        {
          enabled: +true,
          deleted: +false,
          cellsNumber: 6,
          typeId: 1,
          model: "R-line",
          brandId: 1,
          seriesId: 1,
          label: '3'
        }
      this.db.putItem('batteries-anag', b3);
      const b4: BatteryAnagraphInterface =
        {
          enabled: +true,
          deleted: +false,
          cellsNumber: 6,
          typeId: 1,
          model: "R-line",
          brandId: 1,
          seriesId: 1,
          label: '4'
        }
      this.db.putItem('batteries-anag', b4);

      let itemStatus1: BatteryStatusInterface = { idBattery: 1, date: new Date("2024-08-14"), status: batteryStatusActionEnum.Charge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus1)
      itemStatus1 = { idBattery: 1, date: new Date("2024-08-14"), status: batteryStatusActionEnum.Discharge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus1)
      itemStatus1 = { idBattery: 1, date: new Date("2024-08-14"), status: batteryStatusActionEnum.Store, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus1)

      let itemStatus2: BatteryStatusInterface = { idBattery: 2, date: new Date("2024-08-14"), status: batteryStatusActionEnum.Charge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus2)
      itemStatus2 = { idBattery: 2, date: new Date("2024-08-14"), status: batteryStatusActionEnum.Discharge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus2)
      itemStatus2 = { idBattery: 2, date: new Date("2024-08-14"), status: batteryStatusActionEnum.Store, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus2)

      let itemStatus3: BatteryStatusInterface = { idBattery: 3, date: new Date("2024-08-14"), status: batteryStatusActionEnum.Charge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus3)
      itemStatus3 = { idBattery: 3, date: new Date("2024-08-14"), status: batteryStatusActionEnum.Discharge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus3)

      let itemStatus4: BatteryStatusInterface = { idBattery: 4, date: new Date("2024-08-14"), status: batteryStatusActionEnum.Charge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus4)
      itemStatus4 = { idBattery: 4, date: new Date("2024-08-15"), status: batteryStatusActionEnum.Discharge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus4)
      itemStatus4 = { idBattery: 4, date: new Date("2024-08-15"), status: batteryStatusActionEnum.Store, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus4)

      itemStatus3 = { idBattery: 3, date: new Date("2024-08-15"), status: batteryStatusActionEnum.Charge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus3)
      itemStatus3 = { idBattery: 3, date: new Date("2024-08-18"), status: batteryStatusActionEnum.Discharge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus3)
      itemStatus3 = { idBattery: 3, date: new Date("2024-08-18"), status: batteryStatusActionEnum.Store, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus3)

      itemStatus1 = { idBattery: 1, date: new Date("2024-08-17"), status: batteryStatusActionEnum.Charge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus1)
      itemStatus1 = { idBattery: 1, date: new Date("2024-08-18"), status: batteryStatusActionEnum.Discharge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus1)
      itemStatus1 = { idBattery: 1, date: new Date("2024-08-18"), status: batteryStatusActionEnum.Store, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus1)

      itemStatus4 = { idBattery: 4, date: new Date("2024-08-17"), status: batteryStatusActionEnum.Charge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus4)
      itemStatus4 = { idBattery: 4, date: new Date("2024-08-18"), status: batteryStatusActionEnum.Discharge, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus4)
      itemStatus4 = { idBattery: 4, date: new Date("2024-08-18"), status: batteryStatusActionEnum.Store, enabled: +true, deleted: +false };
      this.db.putItem('batteries-status', itemStatus4)

      console.log('[DB]: fill Db finish');
    }
}