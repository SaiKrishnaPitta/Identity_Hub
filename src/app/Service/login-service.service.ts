import { Injectable } from '@angular/core';
import { ApiHttpServiceService } from './api-http-service.service';
import { HttpClient } from '@angular/common/http';
import { GET_AUTH_PROVIDERS, REGULAR_LOGIN, SEND_GOOGLE_EMAIL_OTP, SETUP_AUTHENTICATOR, VERIFY_AUTH_OTP, VERIFY_GOOGLE_EMAIL_OTP } from './api.url';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService extends ApiHttpServiceService {

  constructor(
    http: HttpClient,
  ) {
    super(
      http,
    );
  }

  regularLogin(email: string, password: string) {
    const data = {
      email: email,
      password: password
    }
    return this.post<any>(REGULAR_LOGIN, data);
  }

  sendOtpToEmail(email: string) {
    const body = {
      email: email
    };

    return this.post<any>(SEND_GOOGLE_EMAIL_OTP, body);
  }
  verifyotpSenttoMail(email : string , otp : string){
    const body = {
      email: email,
      otp: otp+''
    };
    return this.post<any>(VERIFY_GOOGLE_EMAIL_OTP, body);

  }


  getAuthProviders() {
    return this.get(GET_AUTH_PROVIDERS);
  }
  sendOtp(email: string) {
    const body = {
      email: email
    };

    return this.post<any>('auth/SendGoogleEmailOtp', body);
  }

  setupAuthenticator(email: string) {
    const body = {
      email: email,
    };
    return this.post<any>(SETUP_AUTHENTICATOR, body);
  }

  verifyAuthOtp(email: string, otp: string) {
    const body = {
      email: email,
      otp: otp+''
    };
    return this.post<any>(VERIFY_AUTH_OTP, body);

  }
}
