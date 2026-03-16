import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AdminDashboardComponentComponent } from './admin-dashboard-component/admin-dashboard-component.component';
import { UserDashboardComponentComponent } from './user-dashboard-component/user-dashboard-component.component';
import { MultiSelectModule } from 'primeng/multiselect';


@NgModule({
  declarations: [
    AdminDashboardComponentComponent , UserDashboardComponentComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
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
        ToastModule ,TableModule,
        MultiSelectModule
  ],providers: [MessageService]
})
export class DashboardModule { }
