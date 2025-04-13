import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { DateUtilsService } from '../../../../utils/date-utils.service';
import { AuthService } from '../../../auth';
import { IReducedDetailedPurchaseModel } from '../../../purchases/interfaces/purchase.interface';
import { PurchaseService } from '../../../purchases/services/purchase.service';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import {
  ILogisticsCategoryModel,
  LogisticsCategoryEnum,
} from '../../../shared/interfaces/logistic-type.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
import { ActivatedRoute, Router } from '@angular/router';
import { LogisticsItemsListingComponent } from '../../widgets/logistics-items-listing/logistics-items-listing.component';

@Component({
  selector: 'app-new-logistics',
  templateUrl: './new-logistics.component.html',
  styleUrl: './new-logistics.component.scss',
})
export class NewLogisticsComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.LOGISTICS.NEW_LOGISTICS;

  @ViewChild('personnelListing')
  personnelListingComp: LogisticsItemsListingComponent;

  @ViewChild('inputListing')
  inputListingComp: LogisticsItemsListingComponent;

  isOnlyBuyer = false;
  controlNumber: string;

  logisticsModel: ICreateUpdateLogisticsModel;
  purchaseModel: IReducedDetailedPurchaseModel;

  logisticsTypes: LogisticsTypeEnum[];
  logisticsTypeLabels: { [key in LogisticsTypeEnum]?: string } = {};

  logisticsItems: ILogisticsItemModel[] = [];
  personnellogisticsItems: ILogisticsItemModel[] = [];
  inputlogisticsItems: ILogisticsItemModel[] = [];

  personnelLogisticsCategoryList: ILogisticsCategoryModel[] = [];
  inputLogisticsCategoryList: ILogisticsCategoryModel[] = [];

  logisticsId: string | undefined;

  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private alertService: AlertService,
    private authService: AuthService,
    private dateUtils: DateUtilsService,
    private logisticsCategoryService: LogisticsCategoryService,
    private purchaseService: PurchaseService,
    private logisticsService: LogisticsService,
    private route: ActivatedRoute,
    private router: Router,
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

            this.inputlogisticsItems = logistics.items.filter(
              (item) =>
                item.logisticsCategory.category === LogisticsCategoryEnum.INPUTS
            );

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

        this.inputLogisticsCategoryList = categories.filter(
          (logistic) => logistic.category === LogisticsCategoryEnum.INPUTS
        );
      },
      error: (error) => {
        console.error('Error fetching logistics categories:', error);
      },
    });
  }

  confirmSave(event: Event, form: NgForm) {
    if (form && form.invalid) {
      return;
    }

    this.personnelListingComp.emitCurrentValidItems();
    this.inputListingComp.emitCurrentValidItems();

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

  handleNewLogistics(): void {
    const currentUrl = this.router.url;

    if (currentUrl === '/logistics/new') {
      // If already on /logistics/new, reload the route (force component reset)
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/logistics/new']);
      });
    } else {
      // Otherwise, navigate to /logistics/new
      this.router.navigate(['/logistics/new']);
    }
  }

  handlePersonnelLogisticsItems(items: ILogisticsItemModel[]) {
    this.personnellogisticsItems = items;
  }

  handleInputLogisticsItems(items: ILogisticsItemModel[]) {
    this.inputlogisticsItems = items;
  }

  onDateChange(event: any): void {
    if (!event) return;

    this.logisticsModel.logisticsDate =
      this.dateUtils.convertLocalDateToUTC(event);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
