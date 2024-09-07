import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  async getFirebaseToken(): Promise<string | null> {
    const user = firebase.auth().currentUser;
    if (user) {
      const token = await user.getIdToken(true);
      return token;
    }
    return null;
  }
}
