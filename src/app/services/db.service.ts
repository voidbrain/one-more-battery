import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { LoadingController } from '@ionic/angular';
import { ToastService } from './toast.service';
import { BatteryAnagraphInterface } from '../interfaces/battery-anagraph';
import { BatteryTypeInterface } from '../interfaces/battery-type';
import { BatteryStatusInterface } from '../interfaces/battery-status';
import { BrandsAnagraphInterface } from '../interfaces/brands-anagraph';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  private db: IDBDatabase | undefined;
  private debug = false;

  constructor(
    private appSettings: SettingsService,
    private loadingController: LoadingController,
    private toastService: ToastService
  ) { 
  }

  async load(): Promise<void> {
    try {
      const resetDb = false; // DB also forged on resetDb
      const forceLoading = true;
  
      // Initialize the database and services
      await this.initDb(resetDb);
      console.log('[DB]: initDb done');
      await this.initService(resetDb || forceLoading);
      console.log('[DB]: initService done');
  
    } catch (error) {
      console.error('[DB]: Error loading data:', error);
      throw error; // Rethrow to propagate the error up the call stack
    }
  }

  async initService(forceLoading = false): Promise<void> {
    const date = new Date();
    const now = Date.now();

    const promise = await this.createDb();

    if (this.debug) {
      console.info('[DB]: Force data sync');
    }
    
    const loading = await this.loadingController.create({ message: 'Loading' });
    loading.present();
    
    try {
      await promise;
      loading.dismiss();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async deleteDb(): Promise<boolean> {
    this.toastService.pushMessage('Database reset');
    this.toastService.presentToast();
    localStorage.clear();
    const request = indexedDB.deleteDatabase(this.appSettings.appName);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        if (this.debug) {
          console.info('[DB]: Delete db Ok');
        }
        resolve(true);
      };
      request.onerror = function () {
        console.error('[DB]: Delete db Error');
        reject(request.error);
      };
    });
  }

  private async createDb(): Promise<void> {
    if (this.db) {
      this.db.close();
    }
  
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open(this.appSettings.appName, this.appSettings.dbVersion); // Use a version number higher than the current
  
      openRequest.onupgradeneeded = async (event) => {
        const db = (event.target as IDBRequest<IDBDatabase>).result;
        const currentVersion = event.oldVersion;
  
        try {
          console.info('[DB]: Migrations', db, currentVersion)
          await this.addMigration(db, currentVersion); // Apply migrations based on currentVersion
          if (this.debug) {
            console.info('[DB]: Migrations applied');
          }
        } catch (error) {
          console.error('[DB]: Error applying migrations', error);
        }
      };
  
      openRequest.onsuccess = (event) => {
        this.db = (event.target as IDBRequest<IDBDatabase>).result;
        if (this.debug) {
          console.info('[DB]: Database ready');
        }
        resolve();
      };
  
      openRequest.onerror = (event) => {
        console.error('[DB]: Error opening database', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }
  

  async initDb(resetDb = false): Promise<void> {
    if (resetDb) {
      if (this.debug) {
        console.info('[DB]: Delete db');
      }
      await this.deleteDb();
    } else {
      if (this.debug) {
        console.info('[DB]: Delete db not required');
      }
    }
  }

  getItem(objectStore: string, id: number, column = 'id'): Promise<BatteryAnagraphInterface | BatteryStatusInterface> {
    const tx = this.db?.transaction(objectStore, 'readonly');
    const store = tx?.objectStore(objectStore);
    const dataIndex: IDBIndex = store?.index(column) as IDBIndex;
    const promise = new Promise<BatteryAnagraphInterface | BatteryStatusInterface>(
      (resolve, reject) => {
        if (id) {
          const queryExecute:IDBRequest<unknown> = dataIndex.get(+id);
          queryExecute.onsuccess = (e) => {
            const request = e.target as IDBRequest;
            if (request.result === undefined) {
              const queryExecute = dataIndex.get([+id]);
              queryExecute.onsuccess = (e) => {
                const request = e.target as IDBRequest;
                resolve(request.result);
              };
              queryExecute.onerror = (e) => {
                console.log(e);
                reject(e);
              };
            }

            resolve(request.result);
          };
          queryExecute.onerror = (e) => {
            console.log(e);
          };
        } else {
          reject(null);
        }
      },
    );
    return promise;
  }

  getItems(
    objectStore: string,
    column = 'enabled, deleted',
    query = [1, 0],
  ): Promise<(BatteryAnagraphInterface | BatteryStatusInterface)[]> {
    const tx = (this.db as IDBDatabase).transaction(objectStore, 'readonly');
    const store = tx.objectStore(objectStore);
    const dataIndex = store.index(column);
    const promise = new Promise<
    (BatteryAnagraphInterface | BatteryStatusInterface)[]
    >((resolve) => {
      if (query.length > 0) {
        const queryExecute = dataIndex.getAll(query);
        queryExecute.onsuccess = (e: Event) => {
          const request = e.target as IDBRequest;
          resolve(request.result);
        };
        queryExecute.onerror = (e) => {
          console.log(e);
        };
      } else {
        const queryExecute = dataIndex.getAll();
        queryExecute.onsuccess = (e) => {
          const request = e.target as IDBRequest;
          resolve(request.result);
        };
        queryExecute.onerror = (e) => {
          console.log(e);
        };
      }
    });
    return promise;
  }

  async putItem(
    objectStore: string,
    item: BatteryAnagraphInterface | BatteryStatusInterface
  ): Promise<void> {
    try {
     
  
        const tx = (this.db as IDBDatabase).transaction(objectStore, 'readwrite');
        const store = tx.objectStore(objectStore);
        const request = store.put(item);
  
        return new Promise<void>((resolve, reject) => {
          request.onsuccess = () => resolve();
          request.onerror = (e) => {
            console.error(`[DB]: Error adding item to ${objectStore}:`, e);
            reject(e);
          };
        });
      
      
    } catch (error) {
      console.error(`[DB]: Failed to put item in ${objectStore}:`, error);
      return Promise.reject(error);
    }
  }
  
  async deleteItem(objectStore: string, item: BatteryAnagraphInterface | BatteryStatusInterface): Promise<void> {
    try {       
        item.deleted = +true;
        await this.performStoreOperation(objectStore as unknown as IDBObjectStore, 'put', item as unknown as IDBValidKey, objectStore);
    } catch (e) {
      console.error(`[DB]: Error processing item: ${e}`);
      throw e; // Rethrow error to allow higher-level handling if needed.
    }
  }

  private performStoreOperation(
    store: IDBObjectStore,
    operation: 'delete' | 'put',
    data: IDBValidKey,
    objectStore: string
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = operation === 'delete' ? store.delete(data) : store.put(data);
  
      request.onsuccess = () => {
        if (this.debug) {
          const action = operation === 'delete' ? 'deleted' : 'updated';
          console.info(`[DB]: Item ${action}. Table: "${objectStore}", Data: ${data}`);
        }
        resolve();
      };
  
      request.onerror = (e) => {
        console.error(`[DB]: Error during ${operation}: ${e}`);
        reject(e);
      };
    });
  }

  /**
   * 
   * MIGRATIONS
   * 
   */

  private migration1(db: IDBDatabase) {
    this.createBrandsAnag(db)
    this.createBatteriesAnag(db);
    this.createBatteriesStatus(db);
    this.createBatteriesTypes(db);
  }

  private createBrandsAnag(db: IDBDatabase) {
    if (!db.objectStoreNames.contains('brands-anag')) {
      const store = db.createObjectStore('brands-anag', { keyPath: 'id', autoIncrement: true });
      store.createIndex('id',['id'],{ unique: false },);
      store.createIndex('enabled, deleted',['enabled', 'deleted'],);
      store.createIndex('deleted',['deleted'],{ unique: false },);
    }
  }

  private createBatteriesAnag(db: IDBDatabase) {
    if (!db.objectStoreNames.contains('batteries-anag')) {
      const store = db.createObjectStore('batteries-anag', { keyPath: 'id', autoIncrement: true });
      store.createIndex('id',['id'],{ unique: false },);
      store.createIndex('enabled, deleted',['enabled', 'deleted'],);
      store.createIndex('deleted',['deleted'],{ unique: false },);
    }
  }
  
  private createBatteriesStatus(db: IDBDatabase) {
    if (!db.objectStoreNames.contains('batteries-status')) {
      const store = db.createObjectStore('batteries-status', { keyPath: 'id', autoIncrement: true });
      store.createIndex('id',['id'],{ unique: false },);
      store.createIndex('enabled, deleted',['enabled', 'deleted'],);
      store.createIndex('deleted',['deleted'],{ unique: false },);
    }
  }

  private createBatteriesTypes(db: IDBDatabase) {
    if (!db.objectStoreNames.contains('batteries-types')) {
      const store = db.createObjectStore('batteries-types', { keyPath: 'id', autoIncrement: true });
      store.createIndex('id',['id'],{ unique: false },);
      store.createIndex('enabled, deleted',['enabled', 'deleted'],);
      store.createIndex('deleted',['deleted'],{ unique: false },);
    }
  }

  private async addMigration(db: IDBDatabase, currentVersion: number): Promise<void> {
    // Define migrations
    const migrations = [
      { version: 1, method: this.migration1 },
    ];
  
    // Apply migrations
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        migration.method.call(this, db); // Apply migration
        currentVersion = migration.version;
      }
    }
  }

  /**
   * 
   * DemoDB
   * 
   */

  public demoDb (){
    console.log("Demo db")
    const itemBatteryType: BatteryTypeInterface =
        {
          enabled: +true,
          deleted: +false,
          name: "LiPo"
        }
      this.putItem('batteries-types', itemBatteryType);

    const itemBrand: BrandsAnagraphInterface =
        {
          enabled: +true,
          deleted: +false,
          name: "Tattu"
        }
      this.putItem('brands-anag', itemBrand);

      const itemAnag: BatteryAnagraphInterface =
        {
          enabled: +true,
          deleted: +false,
          cellsNumber: 6,
          typeId: 1,
          model: "R-line",
          brandId: 1,
        }
      this.putItem('batteries-anag', itemAnag);

      const itemStatus: BatteryStatusInterface =
        {
          enabled: +true,
          deleted: +false,
          idBattery: 1,
          action: 1,
          date: new Date(Date.now()),
        }
      this.putItem('batteries-status', itemStatus)
      console.log("Demo db finish")
    }



  

}