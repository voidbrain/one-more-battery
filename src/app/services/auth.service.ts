import { Injectable } from '@angular/core';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth) {}

  // Method to get the authenticated user
  getUser(): Observable<any> {
    return authState(this.auth);
  }

  // Method to sign in (Example: Google auth)
  signIn() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // Method to sign out
  signOut() {
    return signOut(this.auth);
  }
}
