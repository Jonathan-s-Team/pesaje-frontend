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
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { distinctUntilChanged, finalize, Observable, Subscription } from 'rxjs';
import { PERMISSION_ROUTES } from 'src/app/constants/routes.constants';
import { PurchaseService } from '../services/purchase.service';
import { IReadUserModel } from '../../personal-profile/interfaces/user.interface';
import { IReadCompanyModel } from '../../shared/interfaces/company.interface';
import { IRoleModel } from '../../auth/interfaces/role.interface';
import { AuthService } from '../../auth';
import { UserService } from '../../personal-profile/services/user.service';
import { CompanyService } from '../../shared/services/company.service';
import { BrokerService } from '../../personal-profile/services/broker.service';
import { IReadBrokerModel } from '../../personal-profile/interfaces/broker.interface';
import { ClientService } from '../../shared/services/client.service';
import { IReadClientModel } from '../../shared/interfaces/client.interface';
import { IReadShrimpFarmModel } from '../../shared/interfaces/shrimp-farm.interface';
import { ShrimpFarmService } from '../../shared/services/shrimp-farm.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

type Tabs = 'Details' | 'Payment Info';

@Component({
  selector: 'app-new-purchase',
  templateUrl: './new-purchase.component.html',
  styleUrls: ['./new-purchase.component.scss'],
})
export class NewPurchaseComponent implements OnInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PURCHASES.NEW_PURCHASE;

  @ViewChild('purchaseForm') purchaseForm!: NgForm;

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
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.isLoading$ = this.purchaseService.isLoading$;
  }

  ngOnInit(): void {
    this.roles = this.authService.currentUserValue?.roles!;

    this.isOnlyBuyer =
      this.roles.length > 0 &&
      this.roles.every((role) => role.name === 'Comprador');

    if (this.isOnlyBuyer) {
      const buyerId = this.authService.currentUserValue?.id;
      this.purchaseForm.controls.buyer.setValue(buyerId);
      this.loadBrokers(buyerId as string); // Load brokers immediately
      this.loadClients(buyerId as string); // Load clients immediately
    } else {
      this.loadBuyers(); // Load buyers normally
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

  onBuyerChange(buyerId: string): void {
    if (buyerId) {
      this.loadBrokers(buyerId); // Load brokers when buyer changes
      this.loadClients(buyerId); // Load clients when buyer changes
    }
  }

  onClientChange(clientId: string): void {
    if (clientId) {
      this.loadShrimpFarms(clientId);
    }
  }

  onShrimpFarmChange(farm: IReadShrimpFarmModel): void {
    if (farm) {
      this.farmPlace = farm.place; // ✅ Update input field
    }
  }

  submitForm(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    // Ensure calculated fields are updated before submission
    this.onInputChange();

    const purchaseData = {
      id: this.purchaseId || null, // Check if it's an update
      purchaseDate: form.controls.purchaseDate?.value,
      hasInvoice: form.controls.hasInvoice?.value,
      invoiceNumber: form.controls.invoiceNumber?.value || null,
      buyer: form.controls.buyer?.value,
      company: form.controls.company?.value,
      broker: form.controls.broker?.value,
      client: form.controls.client?.value,
      period: '', // Set period if necessary
      shrimpFarm: form.controls.shrimpFarm?.value.id,
      averageGrams: form.controls.averageGrams?.value,
      price: form.controls.price?.value,
      pounds: form.controls.pounds?.value,
      averageGrams2: form.controls.averageGrams2?.value || 0,
      price2: form.controls.price2?.value || 0,
      pounds2: form.controls.pounds2?.value || 0,
      totalPounds: form.controls.totalPounds?.value,
      subtotal: form.controls.subtotal?.value,
      subtotal2: form.controls.subtotal2?.value,
      grandTotal: form.controls.grandTotal?.value,
      totalAgreedToPay: form.controls.totalAgreedToPay?.value,
    };

    console.log('Submitting purchase data:', purchaseData);

    if (this.purchaseId) {
      // ✅ Update Purchase if ID exists
      this.purchaseService
        .updatePurchase(this.purchaseId, purchaseData)
        .subscribe({
          next: (response) => {
            console.log('Purchase updated successfully:', response);
            this.showSuccessAlert();
          },
          error: (error) => {
            console.error('Error updating purchase:', error);
            this.showErrorAlert(error);
          },
        });
    } else {
      // ✅ Create New Purchase if ID does NOT exist
      this.purchaseService.createPurchase(purchaseData).subscribe({
        next: (response) => {
          console.log('Purchase created successfully:', response);
          this.purchaseId = response.id; // ✅ Store the new ID for future updates
          this.showSuccessAlert();
          form.resetForm(); // Reset form after successful creation
        },
        error: (error) => {
          console.error('Error creating purchase:', error);
          this.showErrorAlert(error);
        },
      });
    }
  }

  addNewClient() {
    this.router.navigate(['clients']);
  }

  preventNegative(event: KeyboardEvent): void {
    // Prevents negative numbers from being typed
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }

  // 🔹 Ensure valid numeric input
  validateNumber(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    // 🔸 Remove invalid characters
    value = value.replace(/[^0-9.]/g, '');

    // 🔸 Prevent multiple decimal points
    if (value.split('.').length > 2) {
      value = value.substring(0, value.lastIndexOf('.'));
    }

    // 🔹 Set the cleaned value back
    inputElement.value = value;
  }

  calculateTotalPounds(): number {
    const pounds = this.purchaseForm?.controls['pounds']?.value || 0;
    const pounds2 = this.purchaseForm?.controls['pounds2']?.value || 0;
    return pounds + pounds2;
  }

  calculateSubtotal(): number {
    const pounds = this.purchaseForm?.controls['pounds']?.value || 0;
    const price = this.purchaseForm?.controls['price']?.value || 0;
    return pounds * price;
  }

  calculateSubtotal2(): number {
    const pounds2 = this.purchaseForm?.controls['pounds2']?.value || 0;
    const price2 = this.purchaseForm?.controls['price2']?.value || 0;
    return pounds2 * price2;
  }

  calculateGrandTotal(): number {
    const subtotal = this.calculateSubtotal();
    const subtotal2 = this.calculateSubtotal2();
    return subtotal + subtotal2;
  }

  onInputChange(): void {
    const pounds = this.purchaseForm.controls.pounds?.value || 0;
    const pounds2 = this.purchaseForm.controls.pounds2?.value || 0;
    const price = this.purchaseForm.controls.price?.value || 0;
    const price2 = this.purchaseForm.controls.price2?.value || 0;

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
  }

  private showSuccessAlert() {
    const options: SweetAlertOptions = {
      title: '¡Éxito!',
      text: 'Los cambios se guardaron correctamente',
      icon: 'success',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3085d6',
      timer: 5000,
      timerProgressBar: true,
    };
    Swal.fire(options);
  }

  private showErrorAlert(error: any) {
    const options: SweetAlertOptions = {
      title: 'Error',
      html: `<strong>${
        error.message || 'Ocurrió un error inesperado.'
      }</strong>`,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33',
      showCloseButton: true,
      focusConfirm: false,
    };
    Swal.fire(options);
  }

  /** 🔴 Unsubscribe from all subscriptions to avoid memory leaks */
  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
