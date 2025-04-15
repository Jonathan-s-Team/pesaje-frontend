import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RecentSalesComponent } from './pages/recent-sales/recent-sales.component';
import { NewCompanySaleComponent } from './pages/new-company-sale/new-company-sale.component';

const routes: Routes = [
  {
    path: 'company',
    component: NewCompanySaleComponent,
  },
  {
    path: 'edit/:id',
    component: NewCompanySaleComponent,
  },
  {
    path: 'list',
    component: RecentSalesComponent,
  },
  { path: '', redirectTo: 'new', pathMatch: 'full' },
  { path: '**', redirectTo: 'new', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesRoutingModule {}
