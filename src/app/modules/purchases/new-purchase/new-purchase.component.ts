import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgForm } from '@angular/forms';
import { distinctUntilChanged, Observable, Subscription } from 'rxjs';
import { PERMISSION_ROUTES } from 'src/app/constants/routes.constants';
import { PurchaseService } from '../services/purchase.service';
import { IReadCompanyModel } from '../../shared/interfaces/company.interface';
import { IRoleModel } from '../../auth/interfaces/role.interface';
import { AuthService } from '../../auth';
import { CompanyService } from '../../shared/services/company.service';
import { BrokerService } from '../../personal-profile/services/broker.service';
import { IReadBrokerModel } from '../../personal-profile/interfaces/broker.interface';
import { ClientService } from '../../shared/services/client.service';
import { IReadClientModel } from '../../shared/interfaces/client.interface';
import { IReadShrimpFarmModel } from '../../shared/interfaces/shrimp-farm.interface';
import { ShrimpFarmService } from '../../shared/services/shrimp-farm.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { FormUtilsService } from 'src/app/utils/form-utils.service';
import { ICreatePurchaseModel } from '../interfaces/purchase.interface';
import { InputUtilsService } from 'src/app/utils/input-utils.service';
import { AlertService } from 'src/app/utils/alert.service';
import {PurchasePaymentListingComponent} from "../purchase-payment-listing/purchase-payment-listing.component";
import { DateUtilsService } from 'src/app/utils/date-utils.service';
import { IReadUserModel } from '../../settings/interfaces/user.interface';
import { UserService } from '../../settings/services/user.service';

type Tabs = 'Details' | 'Payment Info';

@Component({
  selector: 'app-new-purchase',
  templateUrl: './new-purchase.component.html',
  styleUrls: ['./new-purchase.component.scss'],
})
export class NewPurchaseComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PURCHASES.NEW_PURCHASE;

  @ViewChild('purchaseForm') purchaseForm!: NgForm;
  @ViewChild('paymentsModal') private modalComponent: PurchasePaymentListingComponent;
  private modalRef: NgbModalRef;

  isLoading$: Observable<boolean>;

  buyersList: IReadUserModel[];
  brokersList: IReadBrokerModel[];
  clientsList: IReadClientModel[];
  shrimpFarmsList: IReadShrimpFarmModel[];
  companiesList: IReadCompanyModel[];

  roles: IRoleModel[];
  isOnlyBuyer = false;

  farmPlace: string = '';
  shrimpFarmSize: string = '';
  shrimpFarmSize2: string = '';
  purchaseId: string | null = null;

  createPurchaseModel: ICreatePurchaseModel = {} as ICreatePurchaseModel;

  /** Stores all active subscriptions */
  private unsubscribe: Subscription[] = [];

  constructor(
    private purchaseService: PurchaseService,
    private userService: UserService,
    private authService: AuthService,
    private companyService: CompanyService,
    private brokerService: BrokerService,
    private clientService: ClientService,
    private shrimpFarmService: ShrimpFarmService,
    private modalService: NgbModal,
    private formUtils: FormUtilsService,
    private inputUtils: InputUtilsService,
    private alertService: AlertService,
    private dateUtils: DateUtilsService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.isLoading$ = this.purchaseService.isLoading$;
  }

  get purchaseDateFormatted(): string | null {
    return this.dateUtils.formatDateForInput(
      this.createPurchaseModel.purchaseDate
    );
  }

  ngOnInit(): void {
    this.roles = this.authService.currentUserValue?.roles!;

    this.isOnlyBuyer =
      this.roles.length > 0 &&
      this.roles.every((role) => role.name === 'Comprador');

    if (this.isOnlyBuyer) {
      this.createPurchaseModel.buyer = this.authService.currentUserValue?.id!;
      this.loadBrokers(this.createPurchaseModel.buyer);
      this.loadClients(this.createPurchaseModel.buyer);
    } else {
      this.loadBuyers();
    }

    this.loadCompanies();
  }

  loadBuyers(): void {
    const userSub = this.userService.getAllUsers(true, 'Comprador').subscribe({
      next: (users: IReadUserModel[]) => {
        this.buyersList = users;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });

    this.unsubscribe.push(userSub);
  }

  loadCompanies(): void {
    const companieSub = this.companyService
      .getCompanies()
      .pipe(distinctUntilChanged())
      .subscribe({
        next: (companies) => (this.companiesList = companies),
        error: (err) => console.error('Error al cargar compañías', err),
      });

    this.unsubscribe.push(companieSub);
  }

  loadBrokers(buyerId: string): void {
    const brokerSub = this.brokerService.getBrokersByUser(buyerId).subscribe({
      next: (brokers: IReadBrokerModel[]) => {
        this.brokersList = brokers;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching brokers:', error);
      },
    });

    this.unsubscribe.push(brokerSub);
  }

  loadClients(buyerId: string): void {
    const clientSub = this.clientService.getClientsByUser(buyerId).subscribe({
      next: (clients: IReadClientModel[]) => {
        this.clientsList = clients;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching clients:', error);
      },
    });

    this.unsubscribe.push(clientSub);
  }

  loadShrimpFarms(clientId: string): void {
    const shrimpFarmSub = this.shrimpFarmService
      .getFarmsByClient(clientId)
      .subscribe({
        next: (farms: IReadShrimpFarmModel[]) => {
          this.shrimpFarmsList = farms;
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching shrimp farms:', error);
        },
      });

    this.unsubscribe.push(shrimpFarmSub);
  }

  onBuyerChange(event: Event): void {
    const buyerId = (event.target as HTMLSelectElement).value;
    if (buyerId) {
      this.loadBrokers(buyerId); // Load brokers when buyer changes
      this.loadClients(buyerId); // Load clients when buyer changes
    }
  }

  onClientChange(event: Event): void {
    const clientId = (event.target as HTMLSelectElement).value;
    if (clientId) {
      this.loadShrimpFarms(clientId);
    }
  }

  onShrimpFarmChange(event: Event): void {
    const farmId = (event.target as HTMLSelectElement).value;
    const farm = this.shrimpFarmsList.filter((sf) => sf.id === farmId)[0];
    if (farm) {
      this.farmPlace = (farm as IReadShrimpFarmModel).place; // ✅ Update input field
    }
  }

  onDateChange(event: any): void {
    if (!event) return;

    this.createPurchaseModel.purchaseDate = this.dateUtils.convertToUTC(event);
  }

  submitForm(): void {
    console.log('Submitting purchase data:', this.createPurchaseModel);

    // if (this.purchaseId) {
    //   // ✅ Update Purchase if ID exists
    //   this.purchaseService
    //     .updatePurchase(this.purchaseId, purchaseData)
    //     .subscribe({
    //       next: (response) => {
    //         console.log('Purchase updated successfully:', response);
    //         this.showSuccessAlert();
    //       },
    //       error: (error) => {
    //         console.error('Error updating purchase:', error);
    //         this.showErrorAlert(error);
    //       },
    //     });
    // } else {
    //   // ✅ Create New Purchase if ID does NOT exist
    //   this.purchaseService.createPurchase(purchaseData).subscribe({
    //     next: (response) => {
    //       console.log('Purchase created successfully:', response);
    //       this.purchaseId = response.id; // ✅ Store the new ID for future updates
    //       this.showSuccessAlert();
    //       form.resetForm(); // Reset form after successful creation
    //     },
    //     error: (error) => {
    //       console.error('Error creating purchase:', error);
    //       this.showErrorAlert(error);
    //     },
    //   });
    // }
  }

  confirmSave(event: Event, form: NgForm): void {
    if (form && form.invalid) {
      return;
    }

    // Ensure calculated fields are updated before submission
    this.onInputChange();

    this.alertService.confirm().then((result) => {
      if (result.isConfirmed) {
        this.submitForm();
      }
    });
  }

  addNewClient() {
    this.router.navigate(['clients']);
  }

  onInputChange(): void {
    const avgGrams = +this.purchaseForm.controls.averageGrams?.value || 0;
    const avgGrams2 = +this.purchaseForm.controls.averageGrams2?.value || 0;
    const pounds = +this.purchaseForm.controls.pounds?.value || 0;
    const pounds2 = +this.purchaseForm.controls.pounds2?.value || 0;
    const price = +this.purchaseForm.controls.price?.value || 0;
    const price2 = +this.purchaseForm.controls.price2?.value || 0;

    // Calculate values
    const totalPounds = pounds + pounds2;
    const subtotal = pounds * price;
    const subtotal2 = pounds2 * price2;
    const grandTotal = subtotal + subtotal2;

    // Set calculated values in the form
    this.purchaseForm.controls.totalPounds?.setValue(totalPounds);
    this.purchaseForm.controls.subtotal?.setValue(subtotal);
    this.purchaseForm.controls.subtotal2?.setValue(subtotal2);
    this.purchaseForm.controls.grandTotal?.setValue(grandTotal);

    // Format disabled fields
    this.formatDecimal('totalPounds');
    this.formatDecimal('subtotal');
    this.formatDecimal('subtotal2');
    this.formatDecimal('grandTotal');

    // Format shrimp size calculations
    this.shrimpFarmSize = this.inputUtils.formatToDecimal(
      avgGrams > 0 ? 1000 / avgGrams : 0
    );
    this.shrimpFarmSize2 = this.inputUtils.formatToDecimal(
      avgGrams2 > 0 ? 1000 / avgGrams2 : 0
    );
  }

  /**
   * 👉 Formats price input value
   */
  formatDecimal(controlName: string) {
    const control = this.purchaseForm.controls[controlName];
    if (control) {
      this.formUtils.formatControlToDecimal(control); // ✅ Use utility function
    }
  }

  /**
   * 👉 Validates numeric input (prevents invalid characters)
   */
  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event); // ✅ Use utility function
  }

  /** 🔴 Unsubscribe from all subscriptions to avoid memory leaks */
  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }

  async openModal() {
    if (this.modalComponent) {
      this.modalRef = this.modalService.open(this.modalComponent.modalContent, {
        size: 'lg',
        centered: true,
        backdrop: 'static',
      });
      this.modalRef.componentInstance.purchaseId = this.purchaseId;
      return this.modalRef.result;
    } else {
      console.error('Modal component is not initialized');
      return false;
    }
  }
}
