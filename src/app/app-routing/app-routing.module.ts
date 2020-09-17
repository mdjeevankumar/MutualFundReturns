import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FundsComponent } from '../ui-module/funds/funds.component';

const routes: Routes = [
  {path:'', redirectTo:'/funds', pathMatch: 'full'},
  {path:'funds',component:FundsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
