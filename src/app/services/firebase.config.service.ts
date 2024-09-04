import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface FirebaseConfig {
  vapidKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseConfigService {
  constructor(private http: HttpClient) {}

  getFirebaseConfig(): Observable<FirebaseConfig> {
    return this.http.get<FirebaseConfig>('/assets/firebase-config.json');
  }
}
