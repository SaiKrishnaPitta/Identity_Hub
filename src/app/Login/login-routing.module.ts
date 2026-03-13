import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponentComponent } from './login-component/login-component.component';
import { RegistrationScreenComponent } from './registration-screen/registration-screen.component';

const routes: Routes = [
    {
    path: '',
    component: LoginComponentComponent
  },{
    path: 'register',
    component: RegistrationScreenComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
