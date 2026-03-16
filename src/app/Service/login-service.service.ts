import { Injectable } from '@angular/core';
import { ApiHttpServiceService } from './api-http-service.service';
import { HttpClient } from '@angular/common/http';
import { GET_AUTH_PROVIDERS, REGISTER_USER, REGULAR_LOGIN, SEND_GOOGLE_EMAIL_OTP, SEND_SMS_OTP, SEND_WHATSAPP_OTP, SETUP_AUTHENTICATOR, UPDATE_AUTH_PROVIDERS, VERIFY_AUTH_OTP, VERIFY_GOOGLE_EMAIL_OTP, VERIFY_SMS_OTP, VERIFY_WHATSAPP_OTP } from './api.url';

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

  updateAuthProviders(providers: any) {
  return this.put<any>(UPDATE_AUTH_PROVIDERS, providers);
}

// SMS OTP
sendSmsOtp(phoneNumber: string) {
  const body = { phoneNumber };
  return this.post<any>(SEND_SMS_OTP, body);
}

verifySmsOtp(phoneNumber: string, otp: string) {
  const body = { phoneNumber, otp: otp + '' };
  return this.post<any>(VERIFY_SMS_OTP, body);
}

// WhatsApp OTP
sendWhatsAppOtp(phoneNumber: string) {
  const body = { phoneNumber };
  return this.post<any>(SEND_WHATSAPP_OTP, body);
}

verifyWhatsAppOtp(phoneNumber: string, otp: string) {
  const body = { phoneNumber, otp: otp + '' };
  return this.post<any>(VERIFY_WHATSAPP_OTP, body);
}

register(provider : string , email: string) {
  const body = {
    provider: provider,
    identifier: email
  };
  return this.post<any>(REGISTER_USER, body);

}

}
