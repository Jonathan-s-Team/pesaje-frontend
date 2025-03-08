import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewPurchaseComponent } from './new-purchase/new-purchase.component';

const routes: Routes = [
  {
    path: 'new',
    component: NewPurchaseComponent,
  },
  {
    path: 'list',
    component: NewPurchaseComponent,
  },
  { path: '', redirectTo: 'new', pathMatch: 'full' },
  { path: '**', redirectTo: 'new', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchasesRoutingModule {}
