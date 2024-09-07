import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseOptions } from '@angular/fire/app';  // Use FirebaseOptions directly

@Injectable({
  providedIn: 'root',
})
export class FirebaseConfigService {
  constructor(private http: HttpClient) {}

  // Fetches the configuration from the JSON file, now ensuring it matches FirebaseOptions
  getFirebaseConfig(): Observable<FirebaseOptions> {
    return this.http.get<FirebaseOptions>('/assets/data/firebase-config.json');
  }
}
