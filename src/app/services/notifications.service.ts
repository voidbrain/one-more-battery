import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service'; // A service that provides the Firebase token

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private fcmUrl = 'https://fcm.googleapis.com/v1/projects/more-aa0d7/messages:send';

  constructor(private http: HttpClient, private authService: AuthService) {}

  async sendNotificationToUser(deviceToken: string) {
    const firebaseToken = await this.authService.getFirebaseToken();

    if (!firebaseToken) {
      console.error('User not authenticated!');
      return;
    }

    const message = {
      message: {
        notification: {
          title: 'Test Notification',
          body: 'This is a test push notification',
        },
        token: deviceToken,
      },
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${firebaseToken}`, // The access token from Firebase Auth
      'Content-Type': 'application/json',
    });

    this.http.post(this.fcmUrl, message, { headers }).subscribe(
      (response) => {
        console.log('Successfully sent message:', response);
      },
      (error) => {
        console.error('Error sending message:', error);
      }
    );
  }
}
