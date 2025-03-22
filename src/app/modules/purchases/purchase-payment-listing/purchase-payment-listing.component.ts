import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
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
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/utils/alert.service';

@Component({
  selector: 'app-purchase-payment-listing',
  templateUrl: './purchase-payment-listing.component.html',
  styleUrls: ['./purchase-payment-listing.component.scss'],
})
export class PurchasePaymentListingComponent implements OnInit, AfterViewInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PURCHASES.NEW_PURCHASE;

  @Input() purchaseId!: string;

  private unsubscribe: Subscription[] = [];
  private formModalRef: NgbModalRef | null = null;

  isLoading = false;

  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  createPurchasePaymentModel: ICreateUpdatePurchasePaymentModel = {} as ICreateUpdatePurchasePaymentModel;
  purchasePaymentMethodList: IPurchasePaymentMethodModel[] = [];
  purchasePayments: IPurchasePaymentModel[] = [];

  @ViewChild('formPaymentModal') formPaymentModal!: TemplateRef<any>;
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
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal, // Inyectar NgbActiveModal para poder cerrar el modal
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    // Verificar que el purchaseId esté disponible
    console.log('PurchasePaymentListingComponent initialized with purchaseId:', this.purchaseId);
    this.initialize();
  }

  ngAfterViewInit(): void {
    // Cargar datos necesarios
    this.loadPurchasePaymentsMethods();

    // Solo cargar pagos si hay un purchaseId válido
    if (this.purchaseId) {
      this.loadPurchasePaymentsById(this.purchaseId);
    } else {
      console.error('No purchaseId provided to PurchasePaymentListingComponent');
    }
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
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error('Error loading purchase payments:', error);
          this.showAlert({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información de pagos.',
          });
        },
      });

    this.unsubscribe.push(purchasePaymentMethodsSub);
  }

  create() {
    this.createPurchasePaymentModel = {} as ICreateUpdatePurchasePaymentModel;

    // Abrir el modal interno para el formulario de pago
    if (this.formPaymentModal) {
      this.formModalRef = this.modalService.open(this.formPaymentModal, {
        centered: true,
        backdrop: 'static'
      });
    } else {
      console.error('formPaymentModal template is not available');
    }
  }

  delete(id: string): void {
    // Implementar lógica de eliminación si se requiere
    console.log('Delete payment with ID:', id);
    this.alertService.confirm().then((result) => {
      if (result.isConfirmed) {
        // Llamar al servicio para eliminar
      }
    });
  }

  edit(id: string): void {
    // Implementar lógica de edición si se requiere
    console.log('Edit payment with ID:', id);

    // Cargar los datos del pago para editar
    // Luego abrir el modal
  }

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
      // Cerrar el modal de formulario
      if (this.formModalRef) {
        this.formModalRef.close();
        this.formModalRef = null;
      }
    };

    const createFn = () => {
      this.purchasePaymentService.createPurchasePayment(paymentData).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.loadPurchasePaymentsById(this.purchaseId);
          completeFn();
        },
        error: (error) => {
          console.error('Error creating payment:', error);
          errorAlert.text = 'No se pudo crear el pago.';
          this.showAlert(errorAlert);
          this.isLoading = false;
        }
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
    if (this.noticeSwal) {
      this.noticeSwal.fire();
    } else {
      console.warn('noticeSwal component is not available');
    }
  }

  initialize() {
    this.reloadEvent = new EventEmitter<boolean>();
    this.createPurchasePaymentModel = {} as ICreateUpdatePurchasePaymentModel;
  }

  formatDecimal(controlName: string) {
    const control = this.paymentForm?.controls[controlName];
    if (control) {
      this.formUtils.formatControlToDecimal(control);
    }
  }

  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event);
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.unsubscribe.forEach(sub => sub.unsubscribe());

    // Cerrar cualquier modal abierto
    if (this.formModalRef) {
      this.formModalRef.close();
    }
  }
}
