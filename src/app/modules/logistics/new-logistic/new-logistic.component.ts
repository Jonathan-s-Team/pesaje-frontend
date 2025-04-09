import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { DateUtilsService } from '../../../utils/date-utils.service';
import {
  ICreateLogisticModel,
  ILogisticModel,
} from '../interfaces/logistic.interface';
import { AuthService } from '../../auth';
import { IListPurchaseModel } from '../../purchases/interfaces/purchase.interface';
import { PurchaseService } from '../../purchases/services/purchase.service';
import { Config } from 'datatables.net';
import { PERMISSION_ROUTES } from '../../../constants/routes.constants';
import {
  ILogisticTypeModel,
  IReadLogisticTypeModel,
} from '../../shared/interfaces/logistic-type.interface';
import { LogisticTypeService } from '../../shared/services/logistic-type.service';
import { FormUtilsService } from '../../../utils/form-utils.service';
import { InputUtilsService } from '../../../utils/input-utils.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../utils/alert.service';
import { LogisticService } from '../services/logistic.service';

@Component({
  selector: 'app-new-logistic',
  templateUrl: './new-logistic.component.html',
  styleUrl: './new-logistic.component.scss',
})
export class NewLogisticComponent implements OnInit {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PURCHASES.RECENT_PRUCHASES;

  @ViewChild('formLogisticTypeModal') formLogisticTypeModal: any;
  @ViewChild('formInputLogisticTypeModal') formInputLogisticTypeModal: any;

  private logisticItemListSubject = new BehaviorSubject<ILogisticModel[]>([]);
  private inputLogisticItemListSubject = new BehaviorSubject<ILogisticModel[]>(
    []
  );
  private unsubscribe: Subscription[] = [];

  logisticItemList$ = this.logisticItemListSubject.asObservable();
  inputLogisticItemList$ = this.inputLogisticItemListSubject.asObservable();

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
  purchase: string = '';

  controlNumberPurchase: IListPurchaseModel = {} as IListPurchaseModel;
  createLogisticModel: ICreateLogisticModel = {} as ICreateLogisticModel;
  createLogisticItemModel: ILogisticModel = {} as ILogisticModel;
  logisticItemList: ILogisticModel[] = [];
  inputLogisticItemList: ILogisticModel[] = [];
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

  constructor(
    public activeModal: NgbActiveModal,
    private alertService: AlertService,
    private modalService: NgbModal,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private dateUtils: DateUtilsService,
    private logisticTypeService: LogisticTypeService,
    private purchaseService: PurchaseService,
    private formUtils: FormUtilsService,
    private inputUtils: InputUtilsService,
    private ngZone: NgZone,
    private logisticService: LogisticService
  ) {
    // Inicializa las listas y configuraciones
    this.reloadEvent = new EventEmitter<boolean>();

    // Suscríbete a cambios en la lista para actualizar la configuración de la tabla
    this.logisticItemList$.subscribe((items) => {
      this.logisticItemList = items;
      this.datatableConfig = {
        ...this.datatableConfig,
        data: items,
      };
      // Forzar la detección de cambios
      this.cdr.markForCheck();
    });

    this.inputLogisticItemList$.subscribe((items) => {
      this.inputLogisticItemList = items;
      this.datatableConfig2 = {
        ...this.datatableConfig2,
        data: items,
      };
      // Forzar la detección de cambios
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.loadLogisticTypes();

    this.createLogisticModel = {
      purchase: '',
      logisticsDate: this.dateUtils.convertLocalDateToUTC(
        new Date().toISOString().split('T')[0]
      ),
      grandTotal: 0,
      items: [],
    };
  }

  get logisticDateFormatted(): string | null {
    return this.dateUtils.formatISOToDateInput(
      this.createLogisticModel.logisticsDate
    );
  }

  confirmSave(event: Event, form: NgForm) {
    // Prevenir el comportamiento por defecto del formulario
    event.preventDefault();

    // Preparar los items combinando ambas listas
    const allItems = [...this.logisticItemList, ...this.inputLogisticItemList];

    // Calcular el grandTotal sumando el total de todos los items
    const grandTotal = allItems.reduce((sum, item) => sum + item.total, 0);

    // Construir el objeto final
    this.createLogisticModel = {
      purchase: this.purchase,
      logisticsDate: this.createLogisticModel.logisticsDate,
      grandTotal: grandTotal,
      items: allItems,
    };

    console.log('Objeto final a guardar:', this.createLogisticModel);

    this.alertService.confirm().then((result) => {
      if (result.isConfirmed) {
        this.submitForm();
      }
    });
  }

  submitForm() {
    this.logisticService.createLogistic(this.createLogisticModel).subscribe({
      next: (response) => {
        this.alertService.showSuccessAlert({});
      },
      error: (error) => {
        console.error('Error creating purchase:', error);
        this.alertService.showErrorAlert({ error });
      },
    });
  }

  delete() {}

  openPersonalModal() {
    this.createLogisticItemModel = {} as ILogisticModel;
    this.modalService.open(this.formLogisticTypeModal, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
  }

  openInputModal() {
    this.createLogisticItemModel = {} as ILogisticModel;
    this.modalService.open(this.formInputLogisticTypeModal, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
  }

  formatDecimal(controlName: string) {
    /*const control = this.logisticForm.controls[controlName];
    if (control) {
      this.formUtils.formatControlToDecimal(control); // ✅ Use utility function
    }*/
  }

  onDateChange(event: any): void {
    this.createLogisticModel.logisticsDate =
      this.dateUtils.convertLocalDateToUTC(event);
  }

  onSubmitInput(form: NgForm, modal: any): void {
    if (form.valid) {
      // Calcular el total
      this.createLogisticItemModel.total =
        this.createLogisticItemModel.unit * this.createLogisticItemModel.cost;

      // Crear una copia del objeto con propiedades adicionales si es necesario
      const newItem = {
        id: Date.now().toString(), // Identificador único
        ...this.createLogisticItemModel,
      };

      // Actualizar el subject con los nuevos datos
      this.ngZone.run(() => {
        const currentItems = this.inputLogisticItemListSubject.getValue();
        this.inputLogisticItemListSubject.next([...currentItems, newItem]);

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

  onSubmit(form: NgForm, modal: any): void {
    if (form.valid) {
      // Calcular el total
      this.createLogisticItemModel.total =
        this.createLogisticItemModel.unit * this.createLogisticItemModel.cost;

      // Crear una copia del objeto con propiedades adicionales si es necesario
      const newItem = {
        id: Date.now().toString(), // Identificador único
        ...this.createLogisticItemModel,
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
        this.personalLogisticTypeList = types.filter(
          (logistic) => logistic.type == 'PERSONNEL'
        );
        this.inputLogisticTypeList = types.filter(
          (logistic) => logistic.type == 'INPUTS'
        );
      },
      error: (error) => {
        console.error('Error fetching logistic types:', error);
      },
    });
  }

  searchPurchase(): void {
    console.log('search purchase');
    console.log('controlNumber:', this.controlNumber);

    const userId: string | null = this.isOnlyBuyer
      ? this.authService.currentUserValue?.id ?? null
      : null;

    const purchaseSub = this.purchaseService
      .getPurchaseByParams(false, userId, null, null, this.controlNumber)
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
          this.purchase = this.controlNumberPurchase.id;
          this.purchaseDate = this.dateUtils.formatISOToDateInput(
            this.controlNumberPurchase.purchaseDate
          );
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
