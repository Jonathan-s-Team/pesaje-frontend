import {ChangeDetectorRef, Component, EventEmitter} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {NgForm} from "@angular/forms";
import {DateUtilsService} from "../../../utils/date-utils.service";
import {ICreateLogisticModel} from "../interfaces/logistic.interface";
import {AuthService} from "../../auth";
import {IListPurchaseModel} from "../../purchases/interfaces/purchase.interface";
import {PurchaseService} from "../../purchases/services/purchase.service";
import {Config} from "datatables.net";
import {PERMISSION_ROUTES} from "../../../constants/routes.constants";

@Component({
  selector: 'app-new-logistic',
  templateUrl: './new-logistic.component.html',
  styleUrl: './new-logistic.component.scss'
})
export class NewLogisticComponent {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PURCHASES.RECENT_PRUCHASES;

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

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Personal',
        data: 'purchaseDate',
        render: function (data) {
          if (!data) return '-';
          const date = new Date(data);
          return date.toLocaleDateString('es-ES');
        },
      },
      {
        title: 'Unidades',
        data: 'subtotal',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Costo',
        data: 'subtotal2',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Total',
        data: 'grandTotal',
        render: function (data) {
          return data ? data : '-';
        },
      },
    ],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
    },
    createdRow: function (row, data, dataIndex) {
      $('td:eq(0)', row).addClass('d-flex align-items-center');
    },
  };

  datatableConfig2: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Productos o Insumos',
        data: 'purchaseDate',
        render: function (data) {
          if (!data) return '-';
          const date = new Date(data);
          return date.toLocaleDateString('es-ES');
        },
      },
      {
        title: 'Unidades',
        data: 'subtotal',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Costo',
        data: 'subtotal2',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Total',
        data: 'grandTotal',
        render: function (data) {
          return data ? data : '-';
        },
      },
    ],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
    },
    createdRow: function (row, data, dataIndex) {
      $('td:eq(0)', row).addClass('d-flex align-items-center');
    },
  };

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

  delete(){}
  create(){}

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
