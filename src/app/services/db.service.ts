import { Injectable } from '@angular/core';
import { SettingsService } from './settings.service';
import { LoadingController } from '@ionic/angular/standalone';
import { ToastService } from './toast.service';
import { MigrationsService } from './migrations.service';
import { batteryStatusActionEnum } from '../interfaces/battery-status';

interface Deletable {
  deleted?: number;
}

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
  ) {}

  async load(): Promise<void> {
    try {
      const resetDb = this.appSettings.resetDb; // DB also forged on resetDb
      const forceLoading = true;

      // Initialize the database and services
      await this.initDb(resetDb);
      console.info('[DB]: initDb done');
      await this.initService(resetDb || forceLoading);
      console.info('[DB]: initService done');
    } catch (error) {
      console.error('[DB]: Error loading data:', error);
      throw error; // Rethrow to propagate the error up the call stack
    }
  }

  async initService(forceLoading = false): Promise<void> {
    const date = new Date();
    const now = Date.now();

    await this.createDb();

    if (this.debug) {
      console.info('[DB]: Force data sync');
    }

    const loading = await this.loadingController.create({ message: 'Loading' });
    loading.present();

    try {
      await this.createDb();
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
      request.onerror = () => {
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

  async getItem<T>(
    objectStore: string,
    id: number,
    column = 'id'
  ): Promise<T | undefined> {
    try {

      // Ensure the database connection is available
      if (!this.db) {
        throw new Error(`[DB]: Database not initialized.`);
      }

      // Create a readonly transaction and access the object store
      const tx = this.db.transaction(objectStore, 'readonly');
      const store = tx.objectStore(objectStore);
      const dataIndex = store.index(column);

      // Check if the index exists
      if (!dataIndex) {
        throw new Error(`[DB]: Index not found for column: ${column}`);
      }

      // Create a request to get the item by ID
      const request = dataIndex.get(id) as IDBRequest<T>;

      // Return a promise that resolves with the result or rejects on error
      return new Promise<T | undefined>((resolve, reject) => {
        request.onsuccess = (e) => {
          const result = (e.target as IDBRequest<T>).result;
          resolve(result);
        };

        request.onerror = (e) => {
          console.error(`[DB]: Error getting item from ${objectStore}:`, e);
          reject((e.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error(`[DB]: Failed to get item from ${objectStore}:`, error);
      return Promise.reject(error);
    }
  }


  async getTotalCycles(objectStore: string, idBattery: number): Promise<number> {
    try {
      const tx = this.db?.transaction(objectStore, 'readonly');
      const store = tx?.objectStore(objectStore);
      const index = store?.index('idBattery, status, enabled, deleted');

      if (!index) {
        throw new Error(`[DB]: Compound index not found for idBattery, status, enabled, and deleted columns in ${objectStore}`);
      }

      const status = batteryStatusActionEnum.Discharge;
      const enabled = +true;
      const deleted = +false;
      const query = IDBKeyRange.only([idBattery, status, enabled, deleted]);

      const request = index.count(query);

      return new Promise<number>((resolve, reject) => {
        request.onsuccess = (event) => {
          resolve(request.result);
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

  async getLastStatusByDate<T>(
    objectStore: string = 'batteries-status',
    id: string | number,          // Add `id` as a parameter
  ): Promise<T | undefined> {
    try {
      const tx = this.db?.transaction(objectStore, 'readonly');
      const store = tx?.objectStore(objectStore);

      // Construct the index based on 'id, date, enabled, deleted' fields
      const index = store?.index('idBattery, date, enabled, deleted');

      if (!index) {
        throw new Error(`[DB]: Index not found for columns: id, date, enabled, deleted`);
      }

      // Define proper bounds for the IDBKeyRange
      const lowerBound = [id, new Date(0), +true, +false];  // Earliest possible date
      const upperBound = [id, new Date(), +true, +false];     // Latest possible date

      // Use IDBKeyRange.bound() to create a range query between these bounds
      const keyRange = IDBKeyRange.bound(lowerBound, upperBound);

      // Open a cursor on the index using the range and reverse the direction to get the latest entry
      const request = index.openCursor(keyRange, 'prev'); // 'prev' ensures we start with the latest date

      // Return a promise to handle the async behavior of IndexedDB
      return new Promise<T | undefined>((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            // Resolve the result, including the primaryKey (id)
            resolve(cursor.value as T);
          } else {
            // If no record is found, resolve with undefined
            resolve(undefined);
          }
        };

        request.onerror = (event) => {
          console.error('[DB]: Error fetching last item by id and date:', event);
          reject(event);
        };
      });
    } catch (error) {
      console.error(`[DB]: Failed to get last item by id and date in ${objectStore}:`, error);
      return undefined;
    }
  }




  async getItems<T>(
    objectStore: string,
    column = 'enabled, deleted',
    query = [1, 0]
  ): Promise<T[]> {
    try {
      const tx = (this.db as IDBDatabase).transaction(objectStore, 'readonly');
      const store = tx.objectStore(objectStore);
      const dataIndex = store.index(column);
      const request = query.length > 0
        ? dataIndex.getAll(query)
        : dataIndex.getAll();

      return new Promise<T[]>((resolve, reject) => {
        request.onsuccess = (e) => {
          const request = e.target as IDBRequest<T[]>;
          resolve(request.result);
        };
        request.onerror = (e) => {
          console.error(`[DB]: Error getting items from ${objectStore}:`, e);
          reject(e);
        };
      });
    } catch (error) {
      console.error(`[DB]: Failed to get items from ${objectStore}:`, error);
      return Promise.reject(error);
    }
  }

  async putItem<T>(
    objectStore: string,
    item: T
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

  async deleteItem<T extends Deletable>(
    objectStore: string,
    item: T
  ): Promise<void> {
    try {
      // Assuming `deleted` property is common for all types
      if ('deleted' in item) {
        (item as any).deleted = true; // Mark as deleted
      }
      await this.performStoreOperation(objectStore, 'put', item);
    } catch (e) {
      console.error(`[DB]: Error processing item: ${e}`);
      throw e; // Rethrow error to allow higher-level handling if needed.
    }
  }

  private performStoreOperation<T>(
    objectStore: string,
    operation: 'delete' | 'put',
    data: T
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const tx = (this.db as IDBDatabase).transaction(objectStore, 'readwrite');
      const store = tx.objectStore(objectStore);
      const request = operation === 'delete' ? store.delete((data as any).id) : store.put(data);

      request.onsuccess = () => {
        if (this.debug) {
          const action = operation === 'delete' ? 'deleted' : 'updated';
          console.info(`[DB]: Item ${action}. Table: "${objectStore}", Data: ${JSON.stringify(data)}`);
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
