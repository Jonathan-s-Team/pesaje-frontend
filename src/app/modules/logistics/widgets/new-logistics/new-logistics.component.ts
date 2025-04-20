import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { DateUtilsService } from '../../../../utils/date-utils.service';
import { AuthService } from '../../../auth';
import { IReducedDetailedPurchaseModel } from '../../../purchases/interfaces/purchase.interface';
import { PurchaseService } from '../../../purchases/services/purchase.service';
import { Config } from 'datatables.net';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import {
  ILogisticsCategoryModel,
  LogisticsCategoryEnum,
} from '../../../shared/interfaces/logistic-type.interface';
import { FormUtilsService } from '../../../../utils/form-utils.service';
import { InputUtilsService } from '../../../../utils/input-utils.service';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../../utils/alert.service';
import { LogisticsCategoryService } from '../../../shared/services/logistics-category.service';
import {
  ICreateUpdateLogisticsModel,
  IDetailedReadLogisticsModel,
  IReadLogisticsModel,
  LogisticsTypeEnum,
} from '../../interfaces/logistics.interface';
import { LogisticsService } from '../../services/logistics.service';
import {
  ILogisticsItemModel,
  ICreateUpdateLogisticsItemModel,
} from '../../interfaces/logistics-item.interface';
import { IReducedUserModel } from '../../../settings/interfaces/user.interface';
import { IReducedShrimpFarmModel } from '../../../shared/interfaces/shrimp-farm.interface';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-logistics',
  templateUrl: './new-logistics.component.html',
  styleUrl: './new-logistics.component.scss',
})
export class NewLogisticsComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.LOGISTICS.LOGISTICS_FORM;

  @ViewChild('personnelLogisticsFormModal')
  personnelLogisticsFormModal: TemplateRef<any>;
  @ViewChild('inputLogisticsFormModal')
  inputLogisticsFormModal: TemplateRef<any>;

  isOnlyBuyer = false;

  personnelLogisticsReloadEvent: EventEmitter<boolean> = new EventEmitter();
  inputLogisticsReloadEvent: EventEmitter<boolean> = new EventEmitter();
  controlNumber: string;

  logisticsModel: ICreateUpdateLogisticsModel;
  purchaseModel: IReducedDetailedPurchaseModel;

  logisticsTypes: LogisticsTypeEnum[];
  logisticsTypeLabels: { [key in LogisticsTypeEnum]?: string } = {};

  logisticsItemModel: ILogisticsItemModel = {} as ILogisticsItemModel;
  logisticsItems: ILogisticsItemModel[] = [];
  personnellogisticsItems: ILogisticsItemModel[] = [];
  inputlogisticsItems: ILogisticsItemModel[] = [];

  allPersonnelLogisticsCategories: ILogisticsCategoryModel[] = [];
  personnelLogisticsCategoryList: ILogisticsCategoryModel[] = [];

  allInputLogisticsCategories: ILogisticsCategoryModel[] = [];
  inputLogisticsCategoryList: ILogisticsCategoryModel[] = [];

  logisticsId: string | undefined;

  private unsubscribe: Subscription[] = [];

  personnelLogisticsDatatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Personal',
        data: 'logisticsCategory',
        render: function (data) {
          return data ? data.name : '-';
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
          if (!data && data !== 0) return '-';

          const formatted = new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data);

          return `$${formatted}`;
        },
      },
      {
        title: 'Total',
        data: 'total',
        render: function (data) {
          if (!data && data !== 0) return '-';

          const formatted = new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data);

          return `$${formatted}`;
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

  inputLogisticsDatatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
    columns: [
      {
        title: 'Producto o Insumo',
        data: 'logisticsCategory',
        render: function (data) {
          return data ? data.name : '-';
        },
      },
      {
        title: 'Descripción',
        data: 'description',
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
          if (!data && data !== 0) return '-';

          const formatted = new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data);

          return `$${formatted}`;
        },
      },
      {
        title: 'Total',
        data: 'total',
        render: function (data) {
          if (!data && data !== 0) return '-';

          const formatted = new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(data);

          return `$${formatted}`;
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
    private authService: AuthService,
    private dateUtils: DateUtilsService,
    private logisticsCategoryService: LogisticsCategoryService,
    private purchaseService: PurchaseService,
    private formUtils: FormUtilsService,
    private inputUtils: InputUtilsService,
    private logisticsService: LogisticsService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  get logisticsDateFormatted(): string | null {
    return this.dateUtils.formatISOToDateInput(
      this.logisticsModel.logisticsDate
    );
  }

  get purchaseDateFormatted(): string | null {
    return this.dateUtils.formatISOToDateInput(this.purchaseModel.purchaseDate);
  }

  ngOnInit(): void {
    this.logisticsId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isOnlyBuyer = this.authService.isOnlyBuyer;

    this.initializeModels();
    this.loadLogisticsCategories();

    if (this.logisticsId) {
      const logisticsSub = this.logisticsService
        .getLogisticsById(this.logisticsId)
        .subscribe({
          next: (logistics: IDetailedReadLogisticsModel) => {
            this.logisticsModel = {
              id: logistics.id,
              purchase: logistics.purchase?.id,
              type: logistics.type,
              logisticsDate: logistics.logisticsDate,
              grandTotal: logistics.grandTotal,
              items: [],
            };
            this.controlNumber = logistics.purchase.controlNumber!;
            this.purchaseModel = logistics.purchase;

            this.personnellogisticsItems = logistics.items.filter(
              (item) =>
                item.logisticsCategory.category ===
                LogisticsCategoryEnum.PERSONNEL
            );
            this.personnelLogisticsDatatableConfig = {
              ...this.personnelLogisticsDatatableConfig,
              data: [...this.personnellogisticsItems],
            };
            this.personnelLogisticsReloadEvent.emit(true);
            this.updateAvailablePersonnelCategories();

            this.inputlogisticsItems = logistics.items.filter(
              (item) =>
                item.logisticsCategory.category === LogisticsCategoryEnum.INPUTS
            );
            this.inputLogisticsDatatableConfig = {
              ...this.inputLogisticsDatatableConfig,
              data: [...this.inputlogisticsItems],
            };
            this.inputLogisticsReloadEvent.emit(true);
            this.updateAvailableInputCategories();

            if (this.purchaseModel.controlNumber?.includes('CO')) {
              this.logisticsTypeLabels = {
                [LogisticsTypeEnum.SHIPMENT]: 'Envío a Compañía',
              };
              this.logisticsTypes = [LogisticsTypeEnum.SHIPMENT];
            } else {
              this.logisticsTypeLabels = {
                [LogisticsTypeEnum.SHIPMENT]: 'Envío Local',
                [LogisticsTypeEnum.LOCAL_PROCESSING]: 'Procesamiento Local',
              };
              this.logisticsTypes = Object.values(LogisticsTypeEnum);
            }

            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error fetching logistics:', error);
            this.alertService.showErrorAlert({});
          },
        });

      this.unsubscribe.push(logisticsSub);
    }
  }

  initializeModels() {
    this.logisticsModel = {} as ICreateUpdateLogisticsModel;

    this.purchaseModel = {} as IReducedDetailedPurchaseModel;
    this.purchaseModel.buyer = {} as IReducedUserModel;
    this.purchaseModel.broker = {} as IReducedUserModel;
    this.purchaseModel.client = {} as IReducedUserModel;
    this.purchaseModel.shrimpFarm = {} as IReducedShrimpFarmModel;
  }

  loadLogisticsCategories(): void {
    this.logisticsCategoryService.getAllLogisticsCategories().subscribe({
      next: (categories) => {
        this.personnelLogisticsCategoryList = categories.filter(
          (logistic) => logistic.category === LogisticsCategoryEnum.PERSONNEL
        );
        this.allPersonnelLogisticsCategories = [
          ...this.personnelLogisticsCategoryList,
        ];
        this.inputLogisticsCategoryList = categories.filter(
          (logistic) => logistic.category === LogisticsCategoryEnum.INPUTS
        );
        this.allInputLogisticsCategories = [...this.inputLogisticsCategoryList];
      },
      error: (error) => {
        console.error('Error fetching logistics categories:', error);
      },
    });
  }

  confirmSave(event: Event, form: NgForm) {
    if (form && form.invalid) {
      console.log(form);
      return;
    }

    // Check if both lists are empty
    if (
      (!this.personnellogisticsItems ||
        this.personnellogisticsItems.length === 0) &&
      (!this.inputlogisticsItems || this.inputlogisticsItems.length === 0)
    ) {
      this.alertService.showAlert({
        icon: 'warning',
        title: 'Detalle faltante',
        text: 'Ingrese detalle de logística',
      });
      return;
    }

    this.alertService.confirm().then((result) => {
      if (result.isConfirmed) {
        this.submitLogisticsForm();
      }
    });
  }

  submitLogisticsForm() {
    this.logisticsItems = [
      ...this.personnellogisticsItems,
      ...this.inputlogisticsItems,
    ];

    this.logisticsModel.purchase = this.purchaseModel.id;
    this.logisticsModel.items = this.logisticsItems.map(
      (x) =>
        ({
          logisticsCategory: x.logisticsCategory.id,
          unit: x.unit,
          cost: x.cost,
          total: x.total,
          description: x.description,
        } as ICreateUpdateLogisticsItemModel)
    );
    this.logisticsModel.grandTotal = this.logisticsItems.reduce(
      (acc, item) => acc + Number(item.total || 0),
      0
    );
    if (this.logisticsId) {
      this.logisticsService
        .updateLogistics(this.logisticsId, this.logisticsModel)
        .subscribe({
          next: (response) => {
            console.log('Purchase updated successfully:', response);
            this.alertService.showSuccessAlert({});
          },
          error: (error) => {
            console.error('Error updating logistics:', error);
            this.alertService.showErrorAlert({ error });
          },
        });
    } else {
      this.logisticsService.createLogistics(this.logisticsModel).subscribe({
        next: (response) => {
          this.logisticsId = response.id; // ✅ Store the new ID for future updates
          this.alertService.showSuccessAlert({});
        },
        error: (error) => {
          console.error('Error creating logistics:', error);
          this.alertService.showErrorAlert({ error });
        },
      });
    }
  }

  canSaveLogistics(): boolean {
    if (this.purchaseModel.id) return false;
    return true;
  }

  searchPurchase($event: Event): void {
    $event.preventDefault();
    $event.stopPropagation();

    const userId =
      this.isOnlyBuyer && this.authService.currentUserValue?.id
        ? this.authService.currentUserValue.id
        : null;

    const purchaseSub = this.purchaseService
      .getPurchaseByParams(false, userId, null, null, this.controlNumber)
      .subscribe({
        next: (purchases: IReducedDetailedPurchaseModel[]) => {
          if (purchases.length === 0) {
            this.alertService.showAlert({
              icon: 'warning',
              title: 'Sin resultados',
              text: 'No se encontró ninguna compra con ese número de control.',
            });
            this.initializeModels();
            return;
          }

          const purchase = purchases[0];

          // Fetch logistics before assigning
          const logisticsSub = this.logisticsService
            .getLogisticsByParams(false, userId, this.controlNumber)
            .subscribe({
              next: (logistics: IReadLogisticsModel[]) => {
                const isLocal =
                  purchase.company.name?.toLowerCase() === 'local';
                const maxAllowed = isLocal ? 2 : 1;

                if (logistics.length >= maxAllowed) {
                  this.alertService.showAlert({
                    icon: 'warning',
                    title: 'Límite alcanzado',
                    text: isLocal
                      ? 'Ya se han creado los 2 registros logísticos permitidos para compras locales.'
                      : 'Ya existe un registro logístico para esta compra.',
                  });
                  this.initializeModels();
                } else {
                  this.purchaseModel = purchase;

                  if (purchase.controlNumber?.includes('CO')) {
                    this.logisticsTypeLabels = {
                      [LogisticsTypeEnum.SHIPMENT]: 'Envío a Compañía',
                    };
                    this.logisticsTypes = [LogisticsTypeEnum.SHIPMENT];
                  } else {
                    this.logisticsTypeLabels = {
                      [LogisticsTypeEnum.SHIPMENT]: 'Envío Local',
                      [LogisticsTypeEnum.LOCAL_PROCESSING]:
                        'Procesamiento Local',
                    };
                    this.logisticsTypes = Object.values(LogisticsTypeEnum);
                  }
                }
                this.cdr.detectChanges();
              },
              error: (error) => {
                console.error('Error fetching logistics:', error);
                this.alertService.showErrorAlert({});
              },
            });

          this.unsubscribe.push(logisticsSub);
        },
        error: (error) => {
          console.error('Error fetching purchases:', error);
          this.alertService.showErrorAlert({});
        },
      });

    this.unsubscribe.push(purchaseSub);
  }

  createLogistics(type: 'personnel' | 'input') {
    this.logisticsItemModel = {} as ILogisticsItemModel;
    this.logisticsItemModel.id = uuidv4();

    const modalRef =
      type === 'personnel'
        ? this.modalService.open(this.personnelLogisticsFormModal, {
            centered: true,
            backdrop: true,
            keyboard: true,
          })
        : this.modalService.open(this.inputLogisticsFormModal, {
            centered: true,
            backdrop: true,
            keyboard: true,
          });
  }

  editLogisticsItem(id: string, type: 'personnel' | 'input'): void {
    const list =
      type === 'personnel'
        ? this.personnellogisticsItems
        : this.inputlogisticsItems;
    const categoryList =
      type === 'personnel'
        ? this.personnelLogisticsCategoryList
        : this.inputLogisticsCategoryList;

    const foundItem = list.find((item) => item.id === id);
    this.logisticsItemModel = foundItem ?? ({} as ILogisticsItemModel);

    if (this.logisticsItemModel?.logisticsCategory?.id) {
      this.logisticsItemModel.logisticsCategory = categoryList.find(
        (x) => x.id === this.logisticsItemModel.logisticsCategory.id
      )!;
    }
  }

  deletePersonnelLogisticsItem(id: string): void {
    console.log(id, this.personnellogisticsItems);
    this.personnellogisticsItems = this.personnellogisticsItems.filter(
      (item) => item.id !== id
    );
    console.log(id, this.personnellogisticsItems);

    this.personnelLogisticsDatatableConfig = {
      ...this.personnelLogisticsDatatableConfig,
      data: [...this.personnellogisticsItems],
    };
    this.personnelLogisticsReloadEvent.emit(true);
    this.updateAvailablePersonnelCategories();
    this.cdr.detectChanges();
  }

  deleteLogisticsItem(id: string, type: 'personnel' | 'input'): void {
    console.log(id, type);
    if (type === 'personnel') {
      this.personnellogisticsItems = this.personnellogisticsItems.filter(
        (item) => item.id !== id
      );
      this.personnelLogisticsDatatableConfig = {
        ...this.personnelLogisticsDatatableConfig,
        data: [...this.personnellogisticsItems],
      };
      this.personnelLogisticsReloadEvent.emit(true);
      this.updateAvailablePersonnelCategories();
    } else {
      this.inputlogisticsItems = this.inputlogisticsItems.filter(
        (item) => item.id !== id
      );
      this.inputLogisticsDatatableConfig = {
        ...this.inputLogisticsDatatableConfig,
        data: [...this.inputlogisticsItems],
      };
      this.inputLogisticsReloadEvent.emit(true);
      this.updateAvailableInputCategories();
    }

    this.cdr.detectChanges();
  }

  onSubmitPersonnelLogisticsForm(event: Event, myForm: NgForm): void {
    if (myForm && myForm.invalid) {
      return;
    }

    const index = this.personnellogisticsItems.findIndex(
      (item) => item.id === this.logisticsItemModel.id
    );

    if (index > -1) {
      // If item exists, update it
      this.personnellogisticsItems[index] = { ...this.logisticsItemModel };
    } else {
      this.personnellogisticsItems.push({ ...this.logisticsItemModel });
    }
    this.personnelLogisticsDatatableConfig = {
      ...this.personnelLogisticsDatatableConfig,
      data: [...this.personnellogisticsItems],
    };

    this.cdr.detectChanges();
    this.personnelLogisticsReloadEvent.emit(true);
    this.updateAvailablePersonnelCategories();
  }

  onSubmitInputLogisticsForm(event: Event, myForm: NgForm): void {
    if (myForm && myForm.invalid) {
      return;
    }

    const index = this.inputlogisticsItems.findIndex(
      (item) => item.id === this.logisticsItemModel.id
    );

    if (index > -1) {
      // If item exists, update it
      this.inputlogisticsItems[index] = { ...this.logisticsItemModel };
    } else {
      this.inputlogisticsItems.push({ ...this.logisticsItemModel });
    }

    this.inputLogisticsDatatableConfig = {
      ...this.inputLogisticsDatatableConfig,
      data: [...this.inputlogisticsItems],
    };

    this.cdr.detectChanges();
    this.inputLogisticsReloadEvent.emit(true);
    this.updateAvailableInputCategories();
  }

  formatDecimal(form: NgForm, controlName: string) {
    const control = form.controls[controlName];
    if (control) {
      this.formUtils.formatControlToDecimal(control);
    }
  }

  onDateChange(event: any): void {
    if (!event) return;

    this.logisticsModel.logisticsDate =
      this.dateUtils.convertLocalDateToUTC(event);
  }

  calculateTotal(form: NgForm): void {
    const unit = Number(this.logisticsItemModel.unit || 0);
    const cost = Number(this.logisticsItemModel.cost || 0);
    this.logisticsItemModel.total = unit * cost;
    form.controls.total?.setValue(this.logisticsItemModel.total);
    this.formatDecimal(form, 'total');
  }

  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event);
  }

  validateWholeNumber(event: KeyboardEvent) {
    this.inputUtils.validateWholeNumber(event);
  }

  private updateAvailablePersonnelCategories(): void {
    const usedCategoryIds = this.personnellogisticsItems.map(
      (item) => item.logisticsCategory.id
    );

    this.personnelLogisticsCategoryList =
      this.allPersonnelLogisticsCategories.filter(
        (category) => !usedCategoryIds.includes(category.id)
      );
  }

  private updateAvailableInputCategories(): void {
    const usedCategoryIds = this.inputlogisticsItems.map(
      (item) => item.logisticsCategory.id
    );

    this.inputLogisticsCategoryList = this.allInputLogisticsCategories.filter(
      (category) => !usedCategoryIds.includes(category.id)
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
