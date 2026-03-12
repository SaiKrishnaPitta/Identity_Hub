import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UserDashboardComponentComponent } from './Dashboard/user-dashboard-component/user-dashboard-component.component';
import { AdminDashboardComponentComponent } from './Dashboard/admin-dashboard-component/admin-dashboard-component.component';

@NgModule({
  declarations: [
    AppComponent,
    UserDashboardComponentComponent,
    AdminDashboardComponentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
