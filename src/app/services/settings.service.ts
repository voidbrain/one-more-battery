import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public appName = 'OneMoreBattery';

  public datatables = [
    'batteries-anag',
    'batteries-status',
  ];

  constructor() { }
}
