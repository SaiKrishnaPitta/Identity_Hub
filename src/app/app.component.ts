import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  email: string = "";

  constructor(private http: HttpClient) {}

  googleLogin() {
    window.location.href = "https://localhost:7184/api/auth/google-login";
  }
   faceBookLogin() {
    window.location.href = "https://localhost:7184/api/auth/facebook-login";
  }



  microsoftLogin() {
    window.location.href = "https://localhost:7184/api/auth/microsoft-login";
  }

  sendOtp() {

    this.http.post("https://localhost:7184/api/auth/SendGoogleEmailOtp", {
      email: this.email
    })
    .subscribe(res => {
      alert("OTP sent to email");
    });

  }

}
