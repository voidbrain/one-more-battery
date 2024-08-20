export enum batteryStatusActionEnum {
    'Charge' = 1,
    'Discharge' = 2,
    'Store' = 3,
}

export interface BatteryStatusInterface {
    id?: number,
    enabled: number,
    deleted: number,
    idBattery: number,
    status: number,
    date: Date,
}
