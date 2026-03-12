import { Component } from '@angular/core';
import { LoginServiceService } from 'src/app/Service/login-service.service';

@Component({
  selector: 'app-admin-dashboard-component',
  templateUrl: './admin-dashboard-component.component.html'
})
export class AdminDashboardComponentComponent {
  authProvidersData: any;

  constructor( private loginService: LoginServiceService) { }
  ngOninit(){
    this.loginService.getAuthProviders().subscribe((res: any) => {
      this.authProvidersData = res;
      console.log(res);
    });
  }
}
