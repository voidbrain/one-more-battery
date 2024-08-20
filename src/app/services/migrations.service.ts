import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MigrationsService {

    private migration1(db: IDBDatabase) {
      this.createBrandsAnag(db);
      this.createBatteriesSeriesAnag(db);
      this.createBatteriesAnag(db);
      this.createBatteriesStatus(db);
      this.createBatteriesTypes(db);
      this.createBatteriesResistanceLogs(db);
    }

    private createBrandsAnag(db: IDBDatabase) {
      if (!db.objectStoreNames.contains('brands-anag')) {
        const store = db.createObjectStore('brands-anag', { keyPath: 'id', autoIncrement: true });
        store.createIndex('id','id',{ unique: false });
        store.createIndex('enabled, deleted',['enabled', 'deleted'],);
        store.createIndex('deleted',['deleted'],{ unique: false });
      }
    }

    private createBatteriesSeriesAnag(db: IDBDatabase) {
      if (!db.objectStoreNames.contains('batteries-series')) {
        const store = db.createObjectStore('batteries-series', { keyPath: 'id', autoIncrement: true });
        store.createIndex('id','id',{ unique: false });
        store.createIndex('enabled, deleted',['enabled', 'deleted'],);
        store.createIndex('deleted',['deleted'],{ unique: false });
      }
    }

    private createBatteriesAnag(db: IDBDatabase) {
      if (!db.objectStoreNames.contains('batteries-anag')) {
        const store = db.createObjectStore('batteries-anag', { keyPath: 'id', autoIncrement: true });
        store.createIndex('id','id',{ unique: false });
        store.createIndex('enabled, deleted',['enabled', 'deleted'],);
        store.createIndex('deleted',['deleted'],{ unique: false });
      }
    }

    private createBatteriesStatus(db: IDBDatabase) {
      if (!db.objectStoreNames.contains('batteries-status')) {
        const store = db.createObjectStore('batteries-status', { keyPath: 'id', autoIncrement: true });
        store.createIndex('id','id',{ unique: false });
        store.createIndex('enabled, deleted',['enabled', 'deleted'],);
        store.createIndex('deleted',['deleted'],{ unique: false });
        store.createIndex('idBattery, date, enabled, deleted',['idBattery', 'date', 'enabled', 'deleted'],{ unique: false });
        store.createIndex('idBattery, status, enabled, deleted',['idBattery', 'status', 'enabled', 'deleted']);
      }
    }

    private createBatteriesTypes(db: IDBDatabase) {
      if (!db.objectStoreNames.contains('batteries-types')) {
        const store = db.createObjectStore('batteries-types', { keyPath: 'id', autoIncrement: true });
        store.createIndex('id','id',{ unique: false });
        store.createIndex('enabled, deleted',['enabled', 'deleted'],);
        store.createIndex('deleted',['deleted'],{ unique: false });
      }
    }

    private createBatteriesResistanceLogs(db: IDBDatabase) {
      if (!db.objectStoreNames.contains('batteries-resistance-logs')) {
        const store = db.createObjectStore('batteries-resistance-logs', { keyPath: 'id', autoIncrement: true });
        store.createIndex('id','id',{ unique: false });
        store.createIndex('enabled, deleted',['enabled', 'deleted'],);
        store.createIndex('deleted',['deleted'],{ unique: false });
      }
    }

    public async addMigration(db: IDBDatabase, currentVersion: number): Promise<void> {
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
}
