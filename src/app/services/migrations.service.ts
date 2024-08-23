import { Injectable } from '@angular/core';
import { dbTables } from './settings.service';

@Injectable({
  providedIn: 'root',
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
    const objectStore = dbTables['brands-anag']
    if (!db.objectStoreNames.contains(objectStore)) {
      const store = db.createObjectStore(objectStore, {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('id', 'id', { unique: false });
      store.createIndex('enabled, deleted', ['enabled', 'deleted']);
      store.createIndex('deleted', ['deleted'], { unique: false });
    }
  }

  private createBatteriesSeriesAnag(db: IDBDatabase) {
    const objectStore = dbTables['batteries-series'];
    if (!db.objectStoreNames.contains(objectStore)) {
      const store = db.createObjectStore(objectStore, {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('id', 'id', { unique: false });
      store.createIndex('enabled, deleted', ['enabled', 'deleted']);
      store.createIndex('deleted', ['deleted'], { unique: false });
    }
  }

  private createBatteriesAnag(db: IDBDatabase) {
    const objectStore = dbTables['batteries-anag'];
    if (!db.objectStoreNames.contains(objectStore)) {
      const store = db.createObjectStore(objectStore, {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('id', 'id', { unique: false });
      store.createIndex('enabled, deleted', ['enabled', 'deleted']);
      store.createIndex('deleted', ['deleted'], { unique: false });
    }
  }

  private createBatteriesStatus(db: IDBDatabase) {
    const objectStore = dbTables['batteries-status'];
    if (!db.objectStoreNames.contains(objectStore)) {
      const store = db.createObjectStore(objectStore, {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('id', 'id', { unique: false });
      store.createIndex('enabled, deleted', ['enabled', 'deleted']);
      store.createIndex('deleted', ['deleted'], { unique: false });
      store.createIndex(
        'idBattery, date, enabled, deleted',
        ['idBattery', 'date', 'enabled', 'deleted'],
        { unique: false },
      );
      store.createIndex('idBattery, status, enabled, deleted', [
        'idBattery',
        'status',
        'enabled',
        'deleted',
      ]);
    }
  }

  private createBatteriesTypes(db: IDBDatabase) {
    const objectStore = dbTables['batteries-types'];
    if (!db.objectStoreNames.contains(objectStore)) {
      const store = db.createObjectStore(objectStore, {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('id', 'id', { unique: false });
      store.createIndex('enabled, deleted', ['enabled', 'deleted']);
      store.createIndex('deleted', ['deleted'], { unique: false });
    }
  }

  private createBatteriesResistanceLogs(db: IDBDatabase) {
    const objectStore = dbTables['batteries-resistance-logs'];
    if (!db.objectStoreNames.contains(objectStore)) {
      const store = db.createObjectStore(objectStore, {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('id', 'id', { unique: false });
      store.createIndex('enabled, deleted', ['enabled', 'deleted']);
      store.createIndex('idBattery, enabled, deleted', [
        'idBattery',
        'enabled',
        'deleted',
      ]);
      store.createIndex('deleted', ['deleted'], { unique: false });
    }
  }

  public async addMigration(
    db: IDBDatabase,
    currentVersion: number,
  ): Promise<void> {
    // Define migrations
    const migrations = [{ version: 1, method: this.migration1 }];

    // Apply migrations
    for (const migration of migrations) {
      if (migration.version > currentVersion) {
        migration.method.call(this, db); // Apply migration
        currentVersion = migration.version;
      }
    }
  }
}
