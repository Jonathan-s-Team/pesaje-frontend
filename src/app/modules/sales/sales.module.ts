import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CrudModule } from '../crud/crud.module';
import { SharedModule } from '../shared/shared.module';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SalesRoutingModule } from './sales-routing.module';
import { NewCompanySaleComponent } from './pages/new-company-sale/new-company-sale.component';
import { CompanySaleItemsListingComponent } from './widgets/company-sale-items-listing/company-sale-items-listing.component';
import { RecentSalesComponent } from './pages/recent-sales/recent-sales.component';

@NgModule({
  declarations: [
    NewCompanySaleComponent,
    RecentSalesComponent,
    CompanySaleItemsListingComponent,
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CrudModule,
    SharedModule,
    NgbModule,
  ],
  providers: [NgbActiveModal],
})
export class SalesModule {}
