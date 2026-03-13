import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponentComponent } from './login-component/login-component.component';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RegistrationScreenComponent } from './registration-screen/registration-screen.component';
import { TableModule } from 'primeng/table';




@NgModule({
  declarations: [
    LoginComponentComponent,
    RegistrationScreenComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    HttpClientModule,
    FormsModule,
    DividerModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    RadioButtonModule,
    DropdownModule,
    ReactiveFormsModule,
    InputNumberModule,
    ToastModule ,TableModule
  ],
  providers: [MessageService]
})
export class LoginModule { }
