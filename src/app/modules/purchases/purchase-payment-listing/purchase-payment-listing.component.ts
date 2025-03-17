import {ChangeDetectorRef, Component, EventEmitter, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {PERMISSION_ROUTES} from "../../../constants/routes.constants";
import {Config} from "datatables.net";
import {NgForm} from "@angular/forms";
import {SweetAlertOptions} from "sweetalert2";
import {PurchasePaymentService} from "../../shared/services/purchase-payment.service";
import {ICreateUpdatePurchasePaymentModel} from "../../shared/interfaces/purchase-payment.interface";
import {SwalComponent} from "@sweetalert2/ngx-sweetalert2";

@Component({
  selector: 'app-purchase-payment-listing',
  templateUrl: './purchase-payment-listing.component.html',
  styleUrls: ['./purchase-payment-listing.component.scss']
})
export class PurchasePaymentListingComponent implements OnInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PURCHASES.NEW_PURCHASE;

  isLoading = false;

  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  createPurchasePaymentModel: ICreateUpdatePurchasePaymentModel;

  @ViewChild('paymentsModal') public modalContent: TemplateRef<PurchasePaymentListingComponent>;
  @ViewChild('noticeSwal') noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Tipo de Pago',
        data: 'person.identification',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Monto',
        data: 'person.mobilePhone',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Fecha de Pago',
        data: 'person.identification',
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
    private purchasePaymentService: PurchasePaymentService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void { }

  loadPurchasePayments(): void {}
  create() {
    this.createPurchasePaymentModel = {} as ICreateUpdatePurchasePaymentModel;

  }
  delete(id: string): void {}
  edit(id: string): void {}
  onSubmitPayment(event: Event, myForm: NgForm) {
    debugger
    if(myForm && myForm.invalid) {
      return
    }

    this.isLoading = true;

    this.createPurchasePaymentModel.purchase = "67d352f2e3d7f125a2c0d47d";

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
      this.purchasePaymentService.createPurchasePayment(this.createPurchasePaymentModel).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.loadPurchasePayments();
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
}
