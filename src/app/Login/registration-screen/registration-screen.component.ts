import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { LoginServiceService } from 'src/app/Service/login-service.service';

@Component({
  selector: 'app-registration-screen',
  templateUrl: './registration-screen.component.html'
})
export class RegistrationScreenComponent implements OnInit {

  providers: any[] = [];
  currentProvider: any = null;
  stepIndex = 0;

  // will temporarily hold a next-provider name when query param arrives
  // before providers are loaded
  pendingNextProvider: string | null = null;

  loginForm!: FormGroup;
  submitted = false;
  otp: string = '';
  emailForOtp: string = '';
  phoneForSms: string = '';
  phoneForWhatsApp: string = '';
  emailOtpSent = false;
  smsOtpSent = false;
  whatsappOtpSent = false;
  qrCode = '';
  authEmail = '';
  existedEmail = '';

  constructor(
    private loginService: LoginServiceService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    var a = localStorage.getItem('isFirstLogin');
    if(a === null){
     localStorage.setItem('isFirstLogin', true.toString());
    }
    this.existedEmail = localStorage.getItem('Auth_Email') || '';

    this.loginForm = this.fb.group({
      email: [this.existedEmail || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // IMPORTANT: subscribe to queryParams first so we capture OAuth callback params.
    this.route.queryParams.subscribe(params => {
      debugger
      const status = params['status'];
      const next = params['next'];
      console.log('OAuth callback queryParams:', params);

      if (!status) return;

      if (status === 'success') {
        if (next) {
          // If providers already loaded, set immediately, otherwise store pending
          if (this.providers && this.providers.length > 0) {
            console.log('Applying next provider immediately:', next);
            this.setCurrentProviderByName(next);
          } else {
            console.log('Providers not loaded yet — saving pending next provider:', next);
            this.pendingNextProvider = next;
          }
        } else {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Authentication completed.' });
          this.finsihVerification();
        }
      } else if (status === 'notregistered') {
        this.messageService.add({ severity: 'warn', summary: 'Not registered', detail: 'User not found for this provider' });
         this.router.navigate([], { queryParams: {}, replaceUrl: true });

      } else {
        this.messageService.add({ severity: 'error', summary: 'Provider failed', detail: 'External provider authentication failed' });
         this.router.navigate([], { queryParams: {}, replaceUrl: true });

      }

      // Clean query params from URL but keep our pendingNextProvider in memory
          });

    // Load providers after setting up query params handler
    this.loadProviders();
  }

  finsihVerification(){
    this.router.navigate(['/dashboard'], );
          return;
  }

  get f() {
    return this.loginForm.controls;
  }

  loadProviders() {
    debugger
    this.loginService.getAuthProviders().subscribe((res: any) => {
      this.providers = (res || [])
        .filter((p: any) => p.isActive)
        .sort((a: any, b: any) => {
          if (a.order === b.order) return a.name.localeCompare(b.name);
          return a.order - b.order;
        });

      if (this.providers.length > 0) {
        // If we have a pendingNextProvider (from OAuth callback) apply it now.
        if (this.pendingNextProvider) {
          console.log('Applying pending next provider after provider load:', this.pendingNextProvider);
          this.setCurrentProviderByName(this.pendingNextProvider);
          this.pendingNextProvider = null;
        } else {
          this.stepIndex = 0;
          this.currentProvider = this.providers[this.stepIndex];
        }
      } else {
        this.currentProvider = null;
        this.messageService.add({ severity: 'warn', summary: 'No providers', detail: 'No authentication providers found (or none active)' });
      }
    }, (err: any) => {
      console.error('Failed to load providers', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load auth providers' });
    });
  }

  setCurrentProviderByName(name: string | null) {
    debugger
    if (!name) {
      // If no name provided, just move to next in flow
      return this.moveToNextInFlow();
    }

    // normalize casing to be robust
    const normalized = (name || '').toString().trim();
    const p = this.providers.find(x => x.name === normalized) ||
              this.providers.find(x => x.name?.toLowerCase() === normalized?.toLowerCase());

    if (p) {
      this.stepIndex = this.providers.indexOf(p);
      this.currentProvider = p;
      if(this.currentProvider?.name ==='AuthenticatorApplication'){
        this.getGoogleQRCode();
      }
      console.log(`Switched currentProvider to ${p.name} (index ${this.stepIndex})`);
    } else {
      // provider not found in active list — do not blindly move forward.
      // Log and fallback to next active provider instead.
      console.warn('Next provider not present in active providers:', name);
      // fallback — find the index of the provider that matches the name's predecessor,
      // or simply move to next available provider in order.
      this.moveToNextInFlow();
    }
  }


  moveToNextInFlow() {
    this.stepIndex++;
    if (this.stepIndex < this.providers.length) {
      this.currentProvider = this.providers[this.stepIndex];
      this.resetOtpStates();
      console.log('Moved to next provider in flow:', this.currentProvider?.name);
    } else {
      this.currentProvider = null;
      this.messageService.add({ severity: 'success', summary: 'Done', detail: 'Authentication flow completed' });
      console.log('Authentication flow completed');
      this.finsihVerification();
    }
  }

  resetOtpStates() {
    this.otp = '';
    this.emailOtpSent = false;
    this.smsOtpSent = false;
    this.whatsappOtpSent = false;
    this.qrCode = '';
    this.emailForOtp = '';
    this.phoneForSms = '';
    this.phoneForWhatsApp = '';
  }

  isOtp6(): boolean {
    return !!this.otp && this.otp.toString().length === 6;
  }

  // Regular login
  regularLogin() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const formValue = this.loginForm.value;
    this.loginService.regularLogin(formValue.email, formValue.password)
      .subscribe((res: any) => {
        localStorage.setItem('Auth_Email', formValue.email);
        this.existedEmail = formValue.email;
        this.loginForm.reset();

        const nextProvider = res?.nextProvider || res?.NextProvider;
        if (nextProvider) {
          if (this.providers && this.providers.length > 0) {
            this.setCurrentProviderByName(nextProvider);
          } else {
            this.pendingNextProvider = nextProvider;
          }
        } else {
          this.moveToNextInFlow();
        }
      }, (error: any) => {
        console.error('Login error', error);
        const errMsg = error?.error?.message || error?.message || 'Authentication failed';
        if(errMsg == "[object Object]"){
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Authentication failed' });
          return;
        }
        this.messageService.add({ severity: 'error', summary: 'Error', detail: errMsg });
      });
  }

  // OAuth redirects
  startOAuth(providerName: string) {
    const redirect = encodeURIComponent(window.location.origin);
    switch (providerName) {
      case 'Google':
        window.location.href = `https://localhost:7184/api/auth/google-login?redirectUrl=${redirect}`;
        break;
      case 'Facebook':
        window.location.href = `https://localhost:7184/api/auth/facebook-login?redirectUrl=${redirect}`;
        break;
      case 'GitHub':
        window.location.href = `https://localhost:7184/api/auth/github-login?redirectUrl=${redirect}`;
        break;
      case 'LinkedIn':
        window.location.href = `https://localhost:7184/api/auth/linkedin-login?redirectUrl=${redirect}`;
        break;
      case 'Twitter':
        window.location.href = `https://localhost:7184/api/auth/twitter-login?redirectUrl=${redirect}`;
        break;
      case 'Azure':
        window.location.href = `https://localhost:7184/api/auth/azure-login?redirectUrl=${redirect}`;
        break;
      default:
        this.messageService.add({ severity: 'warn', summary: 'Unknown provider', detail: providerName });
    }
  }

  // Email OTP
  sendOtpToMail() {
    const email = this.emailForOtp || this.existedEmail || this.loginForm.get('email')?.value;
    if (!email) {
      this.messageService.add({ severity: 'warn', summary: 'Email required', detail: 'Enter email to send OTP' });
      return;
    }
    this.loginService.sendOtpToEmail(email).subscribe((res: any) => {
      this.emailForOtp = email;
      this.emailOtpSent = true;
      this.messageService.add({ severity: 'success', summary: 'OTP sent', detail: 'Check your email' });
    }, (err: any) => {
      console.error('sendOtpToMail failed', err);
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not send OTP to email' });
    });
  }

  verifyOtpOfMail() {
    const email = this.emailForOtp || this.existedEmail || this.loginForm.get('email')?.value;
    if (!email) return;

    this.loginService.verifyotpSenttoMail(email, this.otp).subscribe((res: any) => {
      debugger
      const next = res?.nextProvider || res?.NextProvider;
      if (next) {
        debugger
        if (this.providers && this.providers.length > 0) {
          this.setCurrentProviderByName(next);
        } else {
          this.pendingNextProvider = next;
        }
      } else {
        this.moveToNextInFlow();
      }
    }, (err: any) => {
      console.error('verifyOtpOfMail failed', err);
      this.messageService.add({ severity: 'error', summary: 'Invalid', detail: 'Invalid or expired OTP' });
    });
  }

  // SMS OTP
  sendSmsOtp() {
    if (!this.phoneForSms) {
      this.messageService.add({ severity: 'warn', summary: 'Phone required', detail: 'Enter phone to send SMS OTP' });
      return;
    }
    this.loginService.sendSmsOtp(this.phoneForSms).subscribe((res: any) => {
      this.smsOtpSent = true;
      this.messageService.add({ severity: 'success', summary: 'Sent', detail: 'SMS OTP sent' });
    }, (err: any) => {
      console.error('sendSmsOtp failed', err);
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not send SMS OTP' });
    });
  }

  verifySmsOtp() {
    if (!this.phoneForSms) return;
    this.loginService.verifySmsOtp(this.phoneForSms, this.otp).subscribe((res: any) => {
      const next = res?.nextProvider || res?.NextProvider;
      if (next) {
        if (this.providers && this.providers.length > 0) {
          this.setCurrentProviderByName(next);
        } else {
          this.pendingNextProvider = next;
        }
      } else {
        this.moveToNextInFlow();
      }
    }, (err: any) => {
      console.error('verifySmsOtp failed', err);
      this.messageService.add({ severity: 'error', summary: 'Invalid', detail: 'Invalid or expired SMS OTP' });
    });
  }

  // WhatsApp OTP
  sendWhatsappOtp() {
    if (!this.phoneForWhatsApp) {
      this.messageService.add({ severity: 'warn', summary: 'Phone required', detail: 'Enter phone to send WhatsApp OTP' });
      return;
    }
    this.loginService.sendWhatsAppOtp(this.phoneForWhatsApp).subscribe((res: any) => {
      this.whatsappOtpSent = true;
      this.messageService.add({ severity: 'success', summary: 'Sent', detail: 'WhatsApp OTP sent' });
    }, (err: any) => {
      console.error('sendWhatsappOtp failed', err);
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not send WhatsApp OTP' });
    });
  }

  verifyWhatsappOtp() {
    if (!this.phoneForWhatsApp) return;
    this.loginService.verifyWhatsAppOtp(this.phoneForWhatsApp, this.otp).subscribe((res: any) => {
      const next = res?.nextProvider || res?.NextProvider;
      if (next) {
        if (this.providers && this.providers.length > 0) {
          this.setCurrentProviderByName(next);
        } else {
          this.pendingNextProvider = next;
        }
      } else {
        this.moveToNextInFlow();
      }
    }, (err: any) => {
      console.error('verifyWhatsappOtp failed', err);
      this.messageService.add({ severity: 'error', summary: 'Invalid', detail: 'Invalid or expired WhatsApp OTP' });
    });
  }

  QrExist = false
  // Authenticator
  getGoogleQRCode() {
    this.QrExist = false;
    const email = this.authEmail || this.existedEmail || this.loginForm.get('email')?.value;
    if (!email) {
      this.messageService.add({ severity: 'warn', summary: 'Email required', detail: 'Enter email to setup authenticator' });
      return;
    }

    this.loginService.setupAuthenticator(email).subscribe((res: any) => {
      debugger
      if (res?.qrCode) {
        this.qrCode = 'data:image/png;base64,' + res.qrCode;
        this.authEmail = email;
        this.messageService.add({ severity: 'success', summary: 'QR ready', detail: 'Scan with Authenticator app' });
      } else {
        this.QrExist = true
      }
    }, (err: any) => {
      console.error('setupAuthenticator failed', err);
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Could not setup authenticator' });
    });
  }

  verifyAuthenticator() {
    const email = this.authEmail || this.existedEmail || this.loginForm.get('email')?.value;
    if (!email) return;

    this.loginService.verifyAuthOtp(email, this.otp).subscribe((res: any) => {
      const next = res?.nextProvider || res?.NextProvider;
      if (next) {
        if (this.providers && this.providers.length > 0) {
          this.setCurrentProviderByName(next);
        } else {
          this.pendingNextProvider = next;
        }
      } else {
        this.moveToNextInFlow();
      }
    }, (err: any) => {
      console.error('verifyAuthenticator failed', err);
      this.messageService.add({ severity: 'error', summary: 'Invalid', detail: 'Invalid authenticator code' });
    });
  }

  ngOnDestroy(){
    debugger
    console.log('Destroyed');
         localStorage.removeItem('isFirstLogin');

  }

}
