import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LogisticRoutingModule} from "./logistic-routing.module";
import {NewLogisticComponent} from "./new-logistic/new-logistic.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";



@NgModule({
  declarations: [NewLogisticComponent],
  imports: [
    CommonModule,
    LogisticRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LogisticModule { }
