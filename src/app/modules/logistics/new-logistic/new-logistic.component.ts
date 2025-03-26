import { Component } from '@angular/core';
import {Observable} from "rxjs";
import {NgForm} from "@angular/forms";
import {DateUtilsService} from "../../../utils/date-utils.service";
import {ICreateLogisticModel} from "../interfaces/logistic.interface";

@Component({
  selector: 'app-new-logistic',
  templateUrl: './new-logistic.component.html',
  styleUrl: './new-logistic.component.scss'
})
export class NewLogisticComponent {

  isLoading$: Observable<boolean>;

  createLogisticModel: ICreateLogisticModel = {} as ICreateLogisticModel;

  constructor(
    private dateUtils: DateUtilsService,
  ) {  }

  get logisticDateFormatted(): string | null {
    return this.dateUtils.formatISOToDateInput(
      this.createLogisticModel.logisticsDate
    );
  }

  confirmSave(event: Event, form: NgForm) {
    // save logic
  }

  onDateChange(event: any): void {
    // date change logic
  }

}
