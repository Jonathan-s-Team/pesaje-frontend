import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RecentLogisticsComponent } from './pages/recent-logistics/recent-logistics.component';
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
    component: RecentLogisticsComponent,
  },
  { path: '', redirectTo: 'new', pathMatch: 'full' },
  { path: '**', redirectTo: 'new', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesRoutingModule {}
