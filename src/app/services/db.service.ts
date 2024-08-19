import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { LoadingController } from '@ionic/angular';
import { ToastService } from './toast.service';
import { BatteryAnagraphInterface } from '../interfaces/battery-anagraph';
import { BatteryStatusInterface } from '../interfaces/battery-status';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  private db: IDBDatabase | undefined;
  private debug = false;
  private tables: string[] = [];

  constructor(
    private appSettings: SettingsService,
    private loadingController: LoadingController,
    private toastService: ToastService
  ) { 
    this.tables = this.appSettings.datatables;
  }

  async load(): Promise<void> {
    try {
      const resetDb = false; // DB also forged on resetDb
      const forceLoading = true;
  
      // Initialize the database and services
      await this.initDb(resetDb);
      await this.initService(resetDb || forceLoading);
  
    } catch (error) {
      console.error('[DB]: Error loading data:', error);
      throw error; // Rethrow to propagate the error up the call stack
    }
  }

  async initService(forceLoading = false): Promise<void> {
    const date = new Date();
    const now = Date.now();

    const promise = this.createDb();

    const lastGlobalUpdate =
      localStorage.getItem(this.appSettings.appName + '_lastglobalupdate') ||
      date.getDate() - 1;
    const hoursWithoutUpdates =
      (Number(now) - Number(lastGlobalUpdate)) / (1000 * 60 * 60);

    if (this.debug) {
      console.info('[DB]: Force data sync');
    }
    localStorage.setItem(
      this.appSettings.appName + '_lastglobalupdate',
      String(now),
    );
    const loading = await this.loadingController.create({ message: 'Loading' });
    loading.present();
    
    try {
      await promise;
      loading.dismiss();
    } catch (error) {
      console.error('An error occurred:', error);
      // Handle error appropriately, for example, by showing an error message
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

  private createDb(): Promise<void> {
    if (this.db) {
      (this.db as IDBDatabase).close();
    }
    return new Promise((resolve) => {
      const openRequest = indexedDB.open(this.appSettings.appName);
      openRequest.onupgradeneeded = (event) => {
        const request = event.target as IDBRequest;
        const db = request.result;
        const storeObjects: Record<string, IDBObjectStore> = {};
        if (this.debug) {
          console.log('[DB]: ', this.tables);
        }
        this.tables.map((table) => {
          console.log('[DB]: createObjectStore', table);

          storeObjects[('store' + table)] = db.createObjectStore(table, {
            keyPath: 'id',
            autoIncrement: true,
          });
          storeObjects[('store' + table)].createIndex('id', ['id']);
          storeObjects[('store' + table)].createIndex(
            'enabled, deleted',
            ['enabled', 'deleted'],
          );
          storeObjects[('store' + table)].createIndex(
            'synced',
            ['synced'],
            { unique: false },
          );
          storeObjects[('store' + table)].createIndex(
            'deleted',
            ['deleted'],
            { unique: false },
          );
         
          if (this.debug) {
            console.info('[DB]: Table created:' + table);
          }
        });
        if (this.debug) {
          console.info('[DB]: Db forged');
        }
      };
      openRequest.onsuccess = (event: Event) => {
        const request = event.target as IDBRequest;
        this.db = request.result;
        (this.db as IDBDatabase).onerror = (error) => {
          console.error('[DB]: error createDb: ' + error);
        };
        if (this.debug) {
          console.info('[DB]: Db Ready');
        }
        resolve();
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
        item.deleted = true;
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

}
