import {ChangeDetectorRef, Component, EventEmitter, NgZone, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {NgForm} from "@angular/forms";
import {DateUtilsService} from "../../../utils/date-utils.service";
import {ICreateLogisticModel, ILogisticModel} from "../interfaces/logistic.interface";
import {AuthService} from "../../auth";
import {IListPurchaseModel} from "../../purchases/interfaces/purchase.interface";
import {PurchaseService} from "../../purchases/services/purchase.service";
import {Config} from "datatables.net";
import {PERMISSION_ROUTES} from "../../../constants/routes.constants";
import {ILogisticTypeModel, IReadLogisticTypeModel} from "../../shared/interfaces/logistic-type.interface";
import {LogisticTypeService} from "../../shared/services/logistic-type.service";
import {FormUtilsService} from "../../../utils/form-utils.service";
import {InputUtilsService} from "../../../utils/input-utils.service";
import {NgbActiveModal, NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-new-logistic',
  templateUrl: './new-logistic.component.html',
  styleUrl: './new-logistic.component.scss'
})
export class NewLogisticComponent implements OnInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PURCHASES.RECENT_PRUCHASES;

  @ViewChild('formLogisticTypeModal') formLogisticTypeModal: any;

  private logisticItemListSubject = new BehaviorSubject<ILogisticModel[]>([]);
  private unsubscribe: Subscription[] = [];

  logisticItemList$ = this.logisticItemListSubject.asObservable();

  isLoading$: Observable<boolean>;
  isOnlyBuyer = false;
  isLoading = false;
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
  createLogisticItemModel: ILogisticModel = {} as ILogisticModel;
  logisticItemList: ILogisticModel[] = [];
  logisticTypeList: ILogisticTypeModel[] = [];
  personalLogisticTypeList: ILogisticTypeModel[] = [];
  inputLogisticTypeList: ILogisticTypeModel[] = [];

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Personal',
        data: 'logisticsType',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Unidades',
        data: 'unit',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Costo',
        data: 'cost',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Total',
        data: 'total',
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
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dateUtils: DateUtilsService,
    private logisticTypeService: LogisticTypeService,
    private purchaseService: PurchaseService,
    private formUtils: FormUtilsService,
    private inputUtils: InputUtilsService,
    private ngZone: NgZone
  ) {
    // Inicializa las listas y configuraciones
    this.reloadEvent = new EventEmitter<boolean>();

    // Suscríbete a cambios en la lista para actualizar la configuración de la tabla
    this.logisticItemList$.subscribe(items => {
      this.logisticItemList = items;
      this.datatableConfig = {
        ...this.datatableConfig,
        data: items
      };
      // Forzar la detección de cambios
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.loadLogisticTypes();
  }

  get logisticDateFormatted(): string | null {
    return this.dateUtils.formatISOToDateInput(
      this.createLogisticModel.logisticsDate
    );
  }

  confirmSave(event: Event, form: NgForm) {
    // save logic
  }

  delete(){}

  createPersonalItem() {
    this.createLogisticItemModel = {} as ILogisticModel;
  }

  createInputItem() {}

  formatDecimal(controlName: string) {
    /*const control = this.logisticForm.controls[controlName];
    if (control) {
      this.formUtils.formatControlToDecimal(control); // ✅ Use utility function
    }*/
  }

  onDateChange(event: any): void {
    // date change logic
  }

  onSubmit(form: NgForm, modal: any): void {
    if (form.valid) {
      // Calcular el total
      this.createLogisticItemModel.total = this.createLogisticItemModel.unit * this.createLogisticItemModel.cost;

      // Crear una copia del objeto con propiedades adicionales si es necesario
      const newItem = {
        id: Date.now().toString(), // Identificador único
        ...this.createLogisticItemModel
      };

      // Actualizar el subject con los nuevos datos
      this.ngZone.run(() => {
        const currentItems = this.logisticItemListSubject.getValue();
        this.logisticItemListSubject.next([...currentItems, newItem]);

        // Cerrar el modal
        modal.close('Success');

        // Emitir evento de recarga después de actualizar los datos
        this.reloadEvent.emit(true);

        // Resetear el formulario y el modelo
        form.resetForm();
        this.createLogisticItemModel = {} as ILogisticModel;

        // Forzar la detección de cambios
        this.cdr.detectChanges();
      });
    }
  }

  loadLogisticTypes(): void {
    this.logisticTypeService.getAllLogisticsTypes().subscribe({
      next: (types) => {
        this.logisticTypeList = types;
        this.personalLogisticTypeList = types.filter((logistic) => logistic.type == 'PERSONNEL');
        this.inputLogisticTypeList = types.filter((logistic) => logistic.type == 'INPUTS');
      },
      error: (error) => {
        console.error('Error fetching logistic types:', error);
      }
    });
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

  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event);
  }

}
