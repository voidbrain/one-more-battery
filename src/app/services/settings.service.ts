import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public appName = '1More';
  public dbVersion = 2;
  public resetDb = false;
  public fillDb = false;

  constructor() {}
}
