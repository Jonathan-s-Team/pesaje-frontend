import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {LogisticRoutingModule} from "./logistic-routing.module";
import {NewLogisticComponent} from "./new-logistic/new-logistic.component";



@NgModule({
  declarations: [NewLogisticComponent],
  imports: [
    CommonModule,
    LogisticRoutingModule
  ]
})
export class LogisticModule { }
