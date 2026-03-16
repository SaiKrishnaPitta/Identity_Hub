import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponentComponent } from './admin-dashboard-component/admin-dashboard-component.component';
import { UserDashboardComponentComponent } from './user-dashboard-component/user-dashboard-component.component';

const routes: Routes = [

  {
    path: 'admin',
    component: AdminDashboardComponentComponent
  },

  {
    path: 'user',
    component: UserDashboardComponentComponent
  },
   {
    path: '**',
    redirectTo: 'admin'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
