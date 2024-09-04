import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirebaseConfigService {
  constructor(private http: HttpClient) {}

  getFirebaseConfig() {
    return this.http.get('./../../assets/data/firebase-config.json');
  }
}
