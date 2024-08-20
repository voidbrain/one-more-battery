import { BatteryStatusInterface } from "./battery-status";
import { BrandsAnagraphInterface } from "./brands-anagraph";

export interface BatterySeriesAnagraphInterface {
    id?: number,
    enabled: number,
    deleted: number,
    label?: string,
    color?: string,
}

export interface BatteryAnagraphInterface {
    id?: number,
    enabled: number,
    deleted: number,
    cellsNumber?: number,
    typeId?: number,
    model?: string,
    brandId?: number,
    label: string,
    seriesId: number,
}
export interface ExtendedBatteryAnagraphInterface {
  anag: BatteryAnagraphInterface,
  series?: BatterySeriesAnagraphInterface,
  lastStatus?: BatteryStatusInterface,
  totalCycles?: number,
  timeRange?: number,
  alertStatus?: string,
  brand?: BrandsAnagraphInterface,
}
