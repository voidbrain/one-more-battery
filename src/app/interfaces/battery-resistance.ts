export interface BatteryResistanceLogInterface {
  id?: number;
  enabled: number;
  deleted: number;
  idBattery: number;
  values: number[];
  date: Date;
  temperature?: number;
}
