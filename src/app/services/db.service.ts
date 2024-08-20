import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { LoadingController } from '@ionic/angular/standalone';
import { ToastService } from './toast.service';
import { BatteryAnagraphInterface, BatterySeriesAnagraphInterface } from '../interfaces/battery-anagraph';
import { BatteryStatusInterface } from '../interfaces/battery-status';
import { MigrationsService } from './migrations.service';
import { BatteryTypeInterface } from '../interfaces/battery-type';
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
    private toastService: ToastService,
    private migrations: MigrationsService,
  ) {
  }

  async load(): Promise<void> {
    try {
      const resetDb = this.appSettings.resetDb; // DB also forged on resetDb
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
          await this.migrations.addMigration(db, currentVersion); // Apply migrations based on currentVersion
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


  async initDb(resetDb = true): Promise<void> {
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

  getItem(objectStore: string, id: number, column = 'id'): Promise<BatteryAnagraphInterface | BatteryStatusInterface | BatteryTypeInterface | BrandsAnagraphInterface | BatterySeriesAnagraphInterface> {
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

  async getTotalCycles(objectStore: string = 'batteries-status', idBattery: number): Promise<number> {
    try {
      const tx = this.db?.transaction(objectStore, 'readonly');
      const store = tx?.objectStore(objectStore);
      const index = store?.index('idBattery, status, enabled, deleted');
  
      if (!index) {
        throw new Error(`[DB]: Compound index not found for idBattery, status, enabled, and deleted columns in ${objectStore}`);
      }
  
      const status = 1;
      const enabled = +true;
      const deleted = +false;

      const query = IDBKeyRange.only([idBattery, status, enabled, deleted]);
      const request = index.count(query);
  
      return new Promise<number>((resolve, reject) => {
        request.onsuccess = (event) => {
          resolve(request.result); // Return the count of records matching the criteria
        };
  
        request.onerror = (event) => {
          console.error(`[DB]: Error counting total cycles in ${objectStore}:`, event);
          reject(event);
        };
      });
    } catch (error) {
      console.error(`[DB]: Failed to get total cycles in ${objectStore}:`, error);
      return Promise.reject(error);
    }
}

  
  async getLastStatusByDate(objectStore: string = 'batteries-status', dateColumn = 'date'): Promise<BatteryAnagraphInterface | BatteryStatusInterface | BatteryTypeInterface | BrandsAnagraphInterface | BatterySeriesAnagraphInterface | null> {
    try {
      const tx = this.db?.transaction(objectStore, 'readonly');
      const store = tx?.objectStore(objectStore);
      const index = store?.index(`${dateColumn}, enabled, deleted`);

      if (!index) {
        throw new Error(`[DB]: Index not found for column: ${dateColumn}`);
      }

      // Open a cursor to iterate through items in reverse order (latest date first)
      const promise = new Promise<
        BatteryAnagraphInterface | BatteryStatusInterface | BatteryTypeInterface | BrandsAnagraphInterface | BatterySeriesAnagraphInterface | null
      >((resolve, reject) => {
        const request = index.openCursor(null, 'prev'); // Open cursor with reverse order

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            resolve(cursor.value); // The first item in reverse order is the latest
          } else {
            resolve(null); // No records found
          }
        };

        request.onerror = (event) => {
          console.error('[DB]: Error fetching last item by date:', event);
          reject(event);
        };
      });

      return await promise;
    } catch (error) {
      console.error(`[DB]: Failed to get last item by date in ${objectStore}:`, error);
      return null;
    }
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
    item: BatteryAnagraphInterface | BatteryStatusInterface | BatteryTypeInterface | BrandsAnagraphInterface | BatterySeriesAnagraphInterface
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

  async deleteItem(objectStore: string, item: BatteryAnagraphInterface | BatteryStatusInterface | BatteryTypeInterface | BrandsAnagraphInterface | BatterySeriesAnagraphInterface): Promise<void> {
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
}
