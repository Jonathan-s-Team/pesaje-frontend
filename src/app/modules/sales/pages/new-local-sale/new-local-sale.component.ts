import {
  CompanySaleStatusEnum,
  ICompanySaleModel,
  ICreateUpdateCompanySaleModel,
  ICreateUpdateLocalSaleModel,
  ILocalSaleModel,
} from './../../interfaces/sale.interface';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { DateUtilsService } from '../../../../utils/date-utils.service';
import { AuthService } from '../../../auth';
import { IReducedDetailedPurchaseModel } from '../../../purchases/interfaces/purchase.interface';
import { PurchaseService } from '../../../purchases/services/purchase.service';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import {
  NgbActiveModal,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
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
import { IReducedPeriodModel } from 'src/app/modules/shared/interfaces/period.interface';
import { CompanySalePaymentListingComponent } from '../../widgets/company-sale-payment-listing/company-sale-payment-listing.component';
import { LocalSaleService } from '../../services/local-sale.service';

@Component({
  selector: 'app-new-local-sale',
  templateUrl: './new-local-sale.component.html',
  styleUrl: './new-local-sale.component.scss',
})
export class NewLocalSaleComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.SALES.LOCAL_SALE_FORM;

  private modalRef: NgbModalRef | null = null;

  @ViewChild('saleForm') saleForm!: NgForm;

  isOnlyBuyer = false;
  hasRouteId = false;
  searchSubmitted = false;
  isAddingPayment = false;
  controlNumber: string;

  localSaleModel: ICreateUpdateLocalSaleModel;
  purchaseModel: IReducedDetailedPurchaseModel;

  companySaleItems: ICompanySaleItemModel[] = [];

  saleId: string | undefined;
  localSaleId: string | undefined;

  private unsubscribe: Subscription[] = [];

  constructor(
    public activeModal: NgbActiveModal,
    private alertService: AlertService,
    private authService: AuthService,
    private dateUtils: DateUtilsService,
    private purchaseService: PurchaseService,
    private localSaleService: LocalSaleService,
    private modalService: NgbModal,
    private formUtils: FormUtilsService,
    private inputUtils: InputUtilsService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get saleDateFormatted(): string | null {
    return this.dateUtils.formatISOToDateInput(this.localSaleModel.saleDate);
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
    this.hasRouteId = !!this.saleId;
    this.isOnlyBuyer = this.authService.isOnlyBuyer;

    this.initializeModels();

    if (this.saleId) {
      const companySaleSub = this.localSaleService
        .getLocalSaleBySaleId(this.saleId)
        .subscribe({
          next: (localSale: ILocalSaleModel) => {
            const { purchase, ...rest } = localSale;
            this.localSaleId = rest.id;
            this.localSaleModel = {
              ...rest,
              purchase: purchase.id,
            };
            this.controlNumber = localSale.purchase.controlNumber!;
            this.purchaseModel = localSale.purchase;

            // this.companySaleItems = localSale.items;

            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error fetching logistics:', error);
            this.alertService.showTranslatedAlert({ alertType: 'error' });
          },
        });

      this.unsubscribe.push(companySaleSub);
    }
  }

  initializeModels() {
    this.localSaleModel = {} as ICreateUpdateLocalSaleModel;

    this.purchaseModel = {} as IReducedDetailedPurchaseModel;
    this.purchaseModel.period = {} as IReducedPeriodModel;
    this.purchaseModel.buyer = {} as IReducedUserModel;
    this.purchaseModel.broker = {} as IReducedUserModel;
    this.purchaseModel.client = {} as IReducedUserModel;
    this.purchaseModel.shrimpFarm = {} as IReducedShrimpFarmModel;
  }

  confirmSave() {
    if (this.saleForm && this.saleForm.invalid) {
      // Mark all controls as touched to trigger validation messages
      Object.values(this.saleForm.controls).forEach((control) => {
        control.markAsTouched();
        control.markAsDirty();
      });

      return;
    }

    // Check if both lists are empty
    if (!this.companySaleItems || this.companySaleItems.length === 0) {
      this.alertService.showTranslatedAlert({
        alertType: 'info',
        messageKey: 'MESSAGES.NO_SALE_DETAILS_ENTERED',
      });
      return;
    }

    this.alertService.confirm().then((result) => {
      if (result.isConfirmed) {
        this.submitLocalSaleForm();
      }
    });
  }

  submitLocalSaleForm() {
    this.localSaleModel.purchase = this.purchaseModel.id;

    // this.localSaleModel.items = this.companySaleItems.map(
    //   ({ id, ...rest }) => rest
    // );
    // this.localSaleModel.poundsGrandTotal = this.companySaleItems.reduce(
    //   (sum, item) => sum + Number(item.pounds || 0),
    //   0
    // );
    // this.localSaleModel.grandTotal = this.companySaleItems.reduce(
    //   (sum, item) => sum + Number(item.total || 0),
    //   0
    // );
    // this.localSaleModel.percentageTotal = this.companySaleItems.reduce(
    //   (sum, item) => sum + Number(item.percentage || 0),
    //   0
    // );

    if (this.localSaleId) {
      // this.localSaleService
      //   .updateCompanySale(this.localSaleId, this.localSaleModel)
      //   .subscribe({
      //     next: (response) => {
      //       this.alertService.showTranslatedAlert({ alertType: 'success' });
      //     },
      //     error: (error) => {
      //       console.error('Error updating logistics:', error);
      //       this.alertService.showTranslatedAlert({ alertType: 'error' });
      //     },
      //   });
    } else {
      this.localSaleService.createLocalSale(this.localSaleModel).subscribe({
        next: (response) => {
          this.localSaleId = response.id;
          this.cdr.detectChanges();
          this.alertService.showTranslatedAlert({ alertType: 'success' });
        },
        error: (error) => {
          console.error('Error creating company sale:', error);
          this.alertService.showTranslatedAlert({ alertType: 'error' });
        },
      });
    }
  }

  canSaveLocalSale(): boolean {
    if (this.purchaseModel.id) return false;
    return true;
  }

  searchPurchase(): void {
    this.searchSubmitted = true;

    if (!this.controlNumber?.trim()) {
      return; // don't search if input is empty
    }

    const userId =
      this.isOnlyBuyer && this.authService.currentUserValue?.id
        ? this.authService.currentUserValue.id
        : null;

    const purchaseSub = this.purchaseService
      .getPurchaseByParams(false, userId, null, null, null, this.controlNumber)
      .subscribe({
        next: (purchases: IReducedDetailedPurchaseModel[]) => {
          const noValidPurchase =
            purchases.length === 0 || purchases[0].company?.name !== 'Local';

          if (noValidPurchase) {
            this.alertService.showTranslatedAlert({
              alertType: 'info',
              messageKey: 'MESSAGES.PURCHASE_NOT_FOUND',
              customIcon: 'info',
            });

            this.initializeModels();
            return;
          }

          this.purchaseModel = purchases[0];
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching purchases:', error);
          this.alertService.showTranslatedAlert({ alertType: 'error' });
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

  goBack(): void {
    this.location.back();
  }

  handleCompanySaleItemsChange(items: ICompanySaleItemModel[]) {
    this.companySaleItems = items;
  }

  onDateChange(event: any): void {
    if (!event) return;

    this.localSaleModel.saleDate = this.dateUtils.convertLocalDateToUTC(event);
  }

  async openPaymentsModal(): Promise<any> {
    if (this.modalRef) {
      return;
    }

    if (!this.localSaleId) {
      return;
    }

    try {
      this.modalRef = this.modalService.open(
        CompanySalePaymentListingComponent,
        {
          size: 'lg',
          centered: true,
          backdrop: 'static',
          keyboard: false,
          windowClass: 'payment-listing-modal',
        }
      );

      // ✅ Set input safely
      this.modalRef.componentInstance.companySaleId = this.localSaleId;

      const result = await this.modalRef.result;
      return result;
    } catch (error) {
      return null;
    } finally {
      this.modalRef = null;
    }
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
