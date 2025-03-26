import {ChangeDetectorRef, Component, EventEmitter} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {NgForm} from "@angular/forms";
import {DateUtilsService} from "../../../utils/date-utils.service";
import {ICreateLogisticModel} from "../interfaces/logistic.interface";
import {AuthService} from "../../auth";
import {IListPurchaseModel} from "../../purchases/interfaces/purchase.interface";
import {PurchaseService} from "../../purchases/services/purchase.service";

@Component({
  selector: 'app-new-logistic',
  templateUrl: './new-logistic.component.html',
  styleUrl: './new-logistic.component.scss'
})
export class NewLogisticComponent {
  private unsubscribe: Subscription[] = [];

  isLoading$: Observable<boolean>;
  isOnlyBuyer = false;
  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  controlNumber: number = 0;
  buyer: string = '';
  broker: string = '';
  company: string = '';
  shrimpFarm: string = '';
  farmPlace: string = '';
  purchaseDate: string = '';

  controlNumberPurchase: IListPurchaseModel = {} as IListPurchaseModel;
  createLogisticModel: ICreateLogisticModel = {} as ICreateLogisticModel;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dateUtils: DateUtilsService,
    private purchaseService: PurchaseService,
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

  searchPurchase(): void {
    console.log('search purchase');
    console.log('controlNumber:', this.controlNumber);

    const userId: string | null = this.isOnlyBuyer
      ? this.authService.currentUserValue?.id ?? null
      : null;

    const purchaseSub = this.purchaseService
      .getPurchaseByParams(false, userId, null, this.controlNumber)
      .subscribe({
        next: (purchases: IListPurchaseModel[]) => {
          console.log(purchases);
          console.log('controlNumberPurchase:', this.controlNumberPurchase);
          this.controlNumberPurchase = purchases[0];
          this.buyer = this.controlNumberPurchase.buyer;
          this.broker = this.controlNumberPurchase.broker;
          this.company = this.controlNumberPurchase.company;
          this.shrimpFarm = this.controlNumberPurchase.shrimpFarm;
          this.farmPlace = this.controlNumberPurchase.shrimpFarm;
          this.purchaseDate = this.dateUtils.formatISOToDateInput(this.controlNumberPurchase.purchaseDate);
          this.reloadEvent.emit(true);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching purchases:', error);
        },
      });
    this.unsubscribe.push(purchaseSub);
  }

}
