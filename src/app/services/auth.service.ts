import { Auth, authState, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth) {}

  // Method to get the authenticated user
  getUser(): Observable<any> {
    return authState(this.auth); // Use `authState` to get the user's authentication state as an observable
  }

  // Method to sign in with Google
  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // Method to sign out
  signOut() {
    return signOut(this.auth);
  }
}
