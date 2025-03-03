import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CrudModule } from 'src/app/modules/crud/crud.module';
import { SharedModule as SharedModuleMetronic } from 'src/app/_metronic/shared/shared.module';
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { SharedModule } from '../../modules/shared/shared.module';
import {ClientListingComponent} from "./clients-listing/client-listing.component";
import {ClientDetailsComponent} from "./client-details/client-details.component";
import {MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import {MatOption, MatSelect, MatSelectModule } from "@angular/material/select";
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [ClientListingComponent, ClientDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ClientListingComponent,
      },
      {
        path: ':clientId',
        component: ClientDetailsComponent,
      },
    ]),
    CrudModule,
    SharedModule,
    SharedModuleMetronic,
    NgbNavModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbTooltipModule,
    SweetAlert2Module.forChild(),
    MatFormField,
    MatSelect,
    MatOption,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
})
export class ClientModule {}
