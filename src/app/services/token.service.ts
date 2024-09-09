import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private token: string | null = null;

  setToken(token: string): void {
    console.log("set", this.token)
    this.token = token;
  }

  getToken(): string | null {
    console.log("get", this.token)
    return this.token;
  }
}
