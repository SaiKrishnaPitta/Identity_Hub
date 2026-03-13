import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LoginServiceService } from 'src/app/Service/login-service.service';


@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html'
})
export class LoginComponentComponent implements OnInit {

  authProvidersData: any;
  activeScreen = 'Regular_Login';
  //activeScreen = 'Google_Microsoft_Otp_to_Mail';
  existedEmail = '';
  loginForm!: FormGroup;
  submitted = false;

  constructor(
    private loginService: LoginServiceService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router, private messageService: MessageService
  ) { }

  ngOnInit() {
    this.existedEmail = localStorage.getItem('Auth_Email') || '';
    //this.getGoogleQRCode();
    this.route.queryParams.subscribe(params => {
      const status = params['status'];
      const next = params['next'];
      if (next === 'AuthenticatorApplication') {
        this.getGoogleQRCode();
      }
      if (!status) return;
      if (status === 'success') {
        if (next) {
          this.activeScreen = next;
        }
        else {
          console.log("Authentication completed");
        }
      }
      else {
        console.log("Provider failed");
      }
      this.router.navigate([], {
        queryParams: {},
        replaceUrl: true
      });
    });

    this.loginForm = this.fb.group({
      email: [localStorage.getItem('Auth_Email') || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.loginService.getAuthProviders().subscribe((res: any) => {
      this.authProvidersData = res;
      console.log(res);
      const activeProviders = this.authProvidersData.filter((p: any) => p.isActive);

      const lowestOrderProvider = activeProviders.reduce((prev: any, curr: any) => {
        return curr.order < prev.order ? curr : prev;
      });

      //this.activeScreen = lowestOrderProvider.name;
    });
  }

  get f() {
    return this.loginForm.controls;
  }
  qrCode = ''
  getGoogleQRCode() {
    this.loginService.setupAuthenticator('saikrishna.p@calibrage.in').subscribe((res: any) => {
      console.log(res);
      this.qrCode = 'data:image/png;base64,' + res.qrCode
    }, (error: any) => {
      console.log(error);
    });
  }
  otp = ''
  verifyOTP() {
    console.log(this.otp);
    console.log(this.loginForm.get('email')?.value);
    this.loginService.verifyAuthOtp('saikrishna.p@calibrage.in', this.otp).subscribe((res: any) => {
      console.log(res);
      debugger
      if (res.nextProvider) {
        this.activeScreen = res.nextProvider;
      }
      else {
        console.log("Authentication completed");
      }
    }, (error: any) => {
      console.log(error);
    });
  }

  showOtpSection = false;
  sendOtpToMail() {
    this.loginService.sendOtpToEmail(this.loginForm.get('email')?.value).subscribe((res: any) => {
      console.log(res);
      this.showOtpSection = true
      window.alert("OTP sent to mail");
    }, (error: any) => {
      console.log(error);
      this.showOtpSection = false
    });
  }

  RegularLogin() {
    debugger
    this.submitted = true;
    if (this.loginForm.invalid) return;
    const formValue = this.loginForm.value;
    this.loginService.regularLogin(formValue.email, formValue.password)
      .subscribe((res: any) => {
        if (res.nextProvider) {
          localStorage.setItem('Auth_Email', formValue.email);
          this.loginForm.reset();
          this.activeScreen = res.nextProvider;
        }
        else {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Authentication successful. Proceeding to next provider.' });
          console.log("Authentication complete");
        }
      }, (error: any) => {
        console.log("Full Error:", error);
        console.log("Error Body:", error?.error);

        let errorMessage = "Authentication failed";

        if (error?.error?.message) {
          if (typeof error.error.message === 'string') {
            errorMessage = error.error.message;
          } else if (typeof error.error.message === 'object') {
            errorMessage = JSON.stringify(error.error.message);
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid UserName or Password. Please try again.'
        });
      });
  }
  moveToNextProvider(currentProviderName: string) {
    if (!this.authProvidersData) return;
    const activeProviders = this.authProvidersData
      .filter((x: any) => x.isActive);
    const sortedProviders = activeProviders.sort((a: any, b: any) => {
      if (a.order === b.order) {
        return a.name.localeCompare(b.name);
      }
      return a.order - b.order;
    });
    console.log("Sorted Providers:", sortedProviders);
    const currentIndex = sortedProviders
      .findIndex((x: any) => x.name === currentProviderName);
    const nextProvider = sortedProviders[currentIndex + 1];
    if (nextProvider) {
      console.log("Next Provider:", nextProvider.name);
      this.activeScreen = nextProvider.name;
    }
    else {
      console.log("Authentication Flow Completed");
      window.alert("Authentication Flow Completed");
    }

  }

  googleLogin() {
    const redirect = encodeURIComponent(window.location.origin);
    window.location.href =
      `https://localhost:7184/api/auth/google-login?redirectUrl=${redirect}`;

  }

  twitter(){
  const redirect = encodeURIComponent(window.location.origin);
  window.location.href =
  'https://localhost:7184/api/auth/twitter-login?redirectUrl='+redirect;
}

linkedIn(){
  const redirect = encodeURIComponent(window.location.origin);
  window.location.href =
  'https://localhost:7184/api/auth/linkedin-login?redirectUrl='+redirect;
}
github(){
  const redirect = encodeURIComponent(window.location.origin);
  window.location.href =
  'https://localhost:7184/api/auth/github-login?redirectUrl=https://localhost:4200'+redirect;
}
  faceBookLogin() {
    const redirect = encodeURIComponent(window.location.origin);
    window.location.href =
      `https://localhost:7184/api/auth/facebook-login?redirectUrl=${redirect}`;

  }


  verifyOTPOfMail() {
    console.log(this.otp)
    this.loginService.verifyotpSenttoMail(this.loginForm.get('email')?.value, this.otp).subscribe((res: any) => {
      console.log(res);
      if (res.nextProvider) {
        this.activeScreen = res.nextProvider;
      }
      else {
        console.log("Authentication completed");
      }
    }
      , (error: any) => {
        console.log(error);
      });
  }

}
