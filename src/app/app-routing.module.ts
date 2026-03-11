import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    loadChildren: () =>
      import('./Login/login.module').then(m => m.LoginModule)
  },

  {
    path: 'dashboard',
    loadChildren: () =>
      import('./Dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  {
    path: '**',
    redirectTo: ''
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
