import { Injectable } from '@angular/core';

export enum dbTables {
  'batteries-status' = 'batteries-status',
  'batteries-series' = 'batteries-series',
  'brands-anag' = 'brands-anag',
  'batteries-types' = 'batteries-types',
  'batteries-resistance-logs' = 'batteries-resistance-logs',
  'batteries-anag' = 'batteries-anag',
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public appName = '1More';
  public dbVersion = 2;
  public resetDb = true;
  public fillDb = true;

  constructor() {}
}
