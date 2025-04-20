import {
  ICompanySaleModel,
  ICreateUpdateCompanySaleModel,
} from './../../interfaces/sale.interface';
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
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../../utils/alert.service';
import { IReducedUserModel } from '../../../settings/interfaces/user.interface';
import {
  IReducedShrimpFarmModel,
  TransportationMethodEnum,
} from '../../../shared/interfaces/shrimp-farm.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { ICompanySaleItemModel } from '../../interfaces/company-sale-item.interface';
import { CompanySaleService } from '../../services/company-sale.service';
import { InputUtilsService } from 'src/app/utils/input-utils.service';
import { FormUtilsService } from 'src/app/utils/form-utils.service';
import { CompanySaleItemsListingComponent } from '../../widgets/company-sale-items-listing/company-sale-items-listing.component';
import { IReducedPeriodModel } from 'src/app/modules/shared/interfaces/period.interface';

@Component({
  selector: 'app-new-company-sale',
  templateUrl: './new-company-sale.component.html',
  styleUrl: './new-company-sale.component.scss',
})
export class NewCompanySaleComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.SALES.NEW_COMPANY;

  @ViewChild('saleForm') saleForm!: NgForm;
  @ViewChild('companySaleItemsListingComponent')
  companySaleItemsListingComponent: CompanySaleItemsListingComponent;

  isOnlyBuyer = false;
  controlNumber: string;

  companySaleModel: ICreateUpdateCompanySaleModel;
  purchaseModel: IReducedDetailedPurchaseModel;

  receptionDate: string = '';
  receptionTime: string = '';
  settleDate: string = '';
  settleTime: string = '';

  companySaleItems: ICompanySaleItemModel[] = [];

  saleId: string | undefined;

  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private alertService: AlertService,
    private authService: AuthService,
    private dateUtils: DateUtilsService,
    private purchaseService: PurchaseService,
    private companySaleService: CompanySaleService,
    private formUtils: FormUtilsService,
    private inputUtils: InputUtilsService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get saleDateFormatted(): string | null {
    return this.dateUtils.formatISOToDateInput(this.companySaleModel.saleDate);
  }

  get purchaseDateFormatted(): string | null {
    return this.dateUtils.formatISOToDateInput(this.purchaseModel.purchaseDate);
  }

  get transportationMethod(): string {
    switch (this.purchaseModel.shrimpFarm.transportationMethod) {
      case TransportationMethodEnum.CAR:
        return 'Carro';
      case TransportationMethodEnum.CARBOAT:
        return 'Carro y Bote';
      default:
        return 'No especificado';
    }
  }

  ngOnInit(): void {
    this.saleId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isOnlyBuyer = this.authService.isOnlyBuyer;

    this.initializeModels();

    if (this.saleId) {
      const companySaleSub = this.companySaleService
        .getCompanySaleBySaleId(this.saleId)
        .subscribe({
          next: (companySale: ICompanySaleModel) => {
            const { purchase, ...rest } = companySale;
            this.companySaleModel = {
              ...rest,
              purchase: purchase.id,
            };
            this.controlNumber = companySale.purchase.controlNumber!;
            this.purchaseModel = companySale.purchase;

            const { date: fetchedReceptionDate, time: fetchedReceptionTime } =
              this.dateUtils.parseISODateTime(
                this.companySaleModel.receptionDateTime
              );
            this.receptionDate = fetchedReceptionDate;
            this.receptionTime = fetchedReceptionTime;

            const { date: fetchedSettleDate, time: fetchedSettleTime } =
              this.dateUtils.parseISODateTime(
                this.companySaleModel.settleDateTime
              );
            this.settleDate = fetchedSettleDate;
            this.settleTime = fetchedSettleTime;

            this.companySaleItems = companySale.items;

            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error fetching logistics:', error);
            this.alertService.showErrorAlert({});
          },
        });

      this.unsubscribe.push(companySaleSub);
    }
  }

  initializeModels() {
    this.companySaleModel = {} as ICreateUpdateCompanySaleModel;

    this.purchaseModel = {} as IReducedDetailedPurchaseModel;
    this.purchaseModel.period = {} as IReducedPeriodModel;
    this.purchaseModel.buyer = {} as IReducedUserModel;
    this.purchaseModel.broker = {} as IReducedUserModel;
    this.purchaseModel.client = {} as IReducedUserModel;
    this.purchaseModel.shrimpFarm = {} as IReducedShrimpFarmModel;
  }

  confirmSave(event: Event, form: NgForm) {
    if (form && form.invalid) {
      return;
    }

    this.companySaleItemsListingComponent.emitCurrentValidItems();
    console.log(this.companySaleModel);

    // Check if both lists are empty
    if (!this.companySaleItems || this.companySaleItems.length === 0) {
      this.alertService.showAlert({
        icon: 'warning',
        title: 'Detalle faltante',
        text: 'Ingrese detalle de venta',
      });
      return;
    }

    this.alertService.confirm().then((result) => {
      if (result.isConfirmed) {
        this.submitCompanySaleForm();
      }
    });
  }

  submitCompanySaleForm() {
    this.companySaleModel.purchase = this.purchaseModel.id;
    this.companySaleModel.receptionDateTime = this.dateUtils.toISODateTime(
      this.receptionDate,
      this.receptionTime
    );
    this.companySaleModel.settleDateTime = this.dateUtils.toISODateTime(
      this.settleDate,
      this.settleTime
    );
    this.companySaleModel.items = this.companySaleItems.map(
      ({ id, ...rest }) => rest
    );
    this.companySaleModel.poundsGrandTotal = this.companySaleItems.reduce(
      (sum, item) => sum + Number(item.pounds || 0),
      0
    );
    this.companySaleModel.grandTotal = this.companySaleItems.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
    this.companySaleModel.percentageTotal = this.companySaleItems.reduce(
      (sum, item) => sum + Number(item.percentage || 0),
      0
    );

    if (this.saleId) {
      // this.logisticsService
      //   .updateLogistics(this.saleId, this.saleModel)
      //   .subscribe({
      //     next: (response) => {
      //       this.alertService.showSuccessAlert({});
      //     },
      //     error: (error) => {
      //       console.error('Error updating logistics:', error);
      //       this.alertService.showErrorAlert({ error });
      //     },
      //   });
    } else {
      this.companySaleService
        .createCompanySale(this.companySaleModel)
        .subscribe({
          next: (response) => {
            this.saleId = response.id; // ✅ Store the new ID for future updates
            this.cdr.detectChanges();
            this.alertService.showSuccessAlert({});
          },
          error: (error) => {
            console.error('Error creating company sale:', error);
            this.alertService.showErrorAlert({});
          },
        });
    }
  }

  canSaveCompanySale(): boolean {
    if (this.purchaseModel.id) return false;
    return true;
  }

  searchPurchase(): void {
    const userId =
      this.isOnlyBuyer && this.authService.currentUserValue?.id
        ? this.authService.currentUserValue.id
        : null;

    const purchaseSub = this.purchaseService
      .getPurchaseByParams(false, userId, null, null, null, this.controlNumber)
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

          this.purchaseModel = purchases[0];
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching purchases:', error);
          this.alertService.showErrorAlert({});
        },
      });

    this.unsubscribe.push(purchaseSub);
  }

  handleNewSale(): void {
    const currentUrl = this.router.url;

    if (currentUrl === '/sales/company') {
      // If already on /sales/company, reload the route (force component reset)
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/sales/company']);
      });
    } else {
      // Otherwise, navigate to /logistics/new
      this.router.navigate(['/sales/company']);
    }
  }

  handleCompanySaleItemsChange(items: ICompanySaleItemModel[]) {
    this.companySaleItems = items;
  }

  onDateChange(event: any): void {
    if (!event) return;

    this.companySaleModel.saleDate =
      this.dateUtils.convertLocalDateToUTC(event);
  }

  formatDecimal(controlName: string) {
    const control = this.saleForm.controls[controlName];
    if (control) {
      this.formUtils.formatControlToDecimal(control);
    }
  }

  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event);
  }

  validateWholeNumber(event: KeyboardEvent) {
    this.inputUtils.validateWholeNumber(event);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
