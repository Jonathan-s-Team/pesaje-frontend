import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LogisticRoutingModule} from "./logistic-routing.module";
import {NewLogisticComponent} from "./new-logistic/new-logistic.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CrudModule} from "../crud/crud.module";
import {SharedModule} from "../shared/shared.module";
import {NgbActiveModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";



@NgModule({
  declarations: [NewLogisticComponent],
  imports: [
    CommonModule,
    LogisticRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CrudModule,
    SharedModule,
    NgbModule
  ],
  providers: [NgbActiveModal]
})
export class LogisticModule { }
