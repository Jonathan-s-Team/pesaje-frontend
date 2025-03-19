import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { PERMISSION_ROUTES } from '../../../constants/routes.constants';
import { Config } from 'datatables.net';
import { NgForm } from '@angular/forms';
import { SweetAlertOptions } from 'sweetalert2';
import { PurchasePaymentService } from '../../shared/services/purchase-payment.service';
import {
  ICreateUpdatePurchasePaymentModel,
  IPurchasePaymentModel,
} from '../../shared/interfaces/purchase-payment.interface';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { FormUtilsService } from '../../../utils/form-utils.service';
import { InputUtilsService } from '../../../utils/input-utils.service';
import { PurchasePaymentMethodService } from '../../shared/services/payment-method.service';
import {
  IPurchasePaymentMethodModel,
  IReadPurchasePaymentMethodModel,
} from '../../shared/interfaces/payment-method.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-purchase-payment-listing',
  templateUrl: './purchase-payment-listing.component.html',
  styleUrls: ['./purchase-payment-listing.component.scss'],
})
export class PurchasePaymentListingComponent implements OnInit, AfterViewInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PURCHASES.NEW_PURCHASE;

  @Input() purchaseId!: string;

  private unsubscribe: Subscription[] = [];

  isLoading = false;

  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  createPurchasePaymentModel: ICreateUpdatePurchasePaymentModel;
  purchasePaymentMethodList: IPurchasePaymentMethodModel[];
  purchasePayments: IPurchasePaymentModel[] = [];

  @ViewChild('paymentsModal')
  public modalContent: TemplateRef<PurchasePaymentListingComponent>;
  @ViewChild('noticeSwal') noticeSwal!: SwalComponent;
  @ViewChild('paymentForm') paymentForm!: NgForm;

  swalOptions: SweetAlertOptions = {};

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Tipo de Pago',
        data: 'paymentMethod',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Monto',
        data: 'amount',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Fecha de Pago',
        data: 'paymentDate',
        render: function (data) {
          if (!data) return '-';
          const date = new Date(data);
          return date.toLocaleDateString('es-ES');
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
    private purchasePaymentService: PurchasePaymentService,
    private purchasePaymentMethodService: PurchasePaymentMethodService,
    private cdr: ChangeDetectorRef,
    private formUtils: FormUtilsService,
    private inputUtils: InputUtilsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.loadPurchasePaymentsMethods();
    this.loadPurchasePaymentsById(this.purchaseId);
  }

  loadPurchasePaymentsMethods(): void {
    const purchasePaymentMethodsSub = this.purchasePaymentMethodService
      .getAllPaymentsMethods()
      .subscribe({
        next: (purchasePaymentMethods: IPurchasePaymentMethodModel[]) => {
          this.purchasePaymentMethodList = purchasePaymentMethods;
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching payment methods:', error);
        },
      });

    this.unsubscribe.push(purchasePaymentMethodsSub);
  }

  loadPurchasePaymentsById(purchaseId: string): void {
    const purchasePaymentMethodsObservable =
      this.purchasePaymentService.getPurchasePaymentsById(purchaseId);

    const purchasePaymentMethodsSub =
      purchasePaymentMethodsObservable.subscribe({
        next: (data) => {
          this.purchasePayments = data;
          this.datatableConfig = {
            ...this.datatableConfig,
            data: [...this.purchasePayments],
          };
        },
        error: () => {
          this.showAlert({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información de clientes.',
          });
        },
      });
  }

  create() {
    this.createPurchasePaymentModel = {} as ICreateUpdatePurchasePaymentModel;
  }
  delete(id: string): void {}
  edit(id: string): void {}
  onSubmitPayment(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const paymentData = {
      ...this.createPurchasePaymentModel,
      amount: +this.createPurchasePaymentModel.amount,
      purchase: this.purchaseId,
    };

    this.createPurchasePaymentModel.purchase = '67d352f2e3d7f125a2c0d47d';

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Éxito!',
      text: '¡Pago creado exitosamente!',
    };

    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: 'Hubo un problema al guardar los cambios.',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    const createFn = () => {
      this.purchasePaymentService.createPurchasePayment(paymentData).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.loadPurchasePaymentsById(this.purchaseId);
        },
        error: (error) => {
          errorAlert.text = 'No se pudo crear el cliente.';
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    createFn();
  }

  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

  initialize() {
    this.reloadEvent = new EventEmitter<boolean>();
    this.createPurchasePaymentModel = {} as ICreateUpdatePurchasePaymentModel;
  }

  formatDecimal(controlName: string) {
    const control = this.paymentForm.controls[controlName];
    if (control) {
      this.formUtils.formatControlToDecimal(control); // ✅ Use utility function
    }
  }

  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event); // ✅ Use utility function
  }
}
