import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EconomicReportComponent } from './pages/economic-report/economic-report.component';

const routes: Routes = [
  {
    path: 'economic',
    component: EconomicReportComponent,
  },

  { path: '', redirectTo: 'new', pathMatch: 'full' },
  { path: '**', redirectTo: 'new', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule {}
