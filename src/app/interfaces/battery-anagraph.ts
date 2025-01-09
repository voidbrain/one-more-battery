import { BatteryResistanceLogInterface } from './battery-resistance';
import { BatteryStatusInterface } from './battery-status';
import { BatteryTypeInterface } from './battery-type';
import { BrandsAnagraphInterface } from './brands-anagraph';

export interface BatterySeriesAnagraphInterface {
  id?: number;
  enabled: number;
  deleted: number;
  label?: string;
  color?: string;
}

export interface BatteryAnagraphInterface {
  id?: number;
  enabled: number;
  deleted: number;
  cellsNumber?: number;
  typeId?: number;
  model?: string;
  mA: number;
  brandId?: number;
  label: string;
  seriesId: number;
  date: Date;
  dateString?: string;
  deletedDate?: Date | null;
  disabledDate?: Date | null;
}
export interface ExtendedBatteryAnagraphInterface {
  anag: BatteryAnagraphInterface;
  series?: BatterySeriesAnagraphInterface;
  lastStatus?: BatteryStatusInterface;
  totalCycles?: number;
  lastStatusTimeRange?: number;
  lastStatusTimeAgo?: string;
  alertStatus?: string;
  brand?: BrandsAnagraphInterface;
  type?: BatteryTypeInterface;
  resistanceLogs?: BatteryResistanceLogInterface[];
}

export interface ExtendedSeriesAnagraph extends BatterySeriesAnagraphInterface {
  batteries?: ExtendedBatteryAnagraphInterface[];
}
