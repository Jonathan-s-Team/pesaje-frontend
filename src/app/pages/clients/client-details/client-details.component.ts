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
import { Observable, Subscription } from 'rxjs';
import {
  ICreateUpdateClientModel,
  IReadClientModel,
} from '../../../modules/shared/interfaces/client.interface';
import { ClientService } from '../../../modules/shared/services/client.service';
import { UserService } from '../../../modules/personal-profile/services/user.service';
import { IReadUsersModel } from '../../../modules/personal-profile/interfaces/user.interface';
import { PERMISSION_ROUTES } from '../../../constants/routes.constants';

type Tabs = 'Details' | 'Shrimp Farms' | 'Payment Info';

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
})
export class ClientDetailsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  PERMISSION_ROUTE = PERMISSION_ROUTES.CLIENTS;

  @ViewChild('clientForm') clientForm!: NgForm;

  isLoading$: Observable<boolean>;
  activeTab: Tabs = 'Details';

  clientData: IReadClientModel = {} as IReadClientModel;
  personId: string = '';
  clientId: string = '';
  formattedBirthDate: string = '';

  /** Propiedades para el multi-select de compradores */
  buyers: IReadUsersModel[] = [];
  selectedBuyers: IReadUsersModel[] = [];

  /** Stores all active subscriptions */
  private unsubscribe: Subscription[] = [];

  constructor(
    private clientService: ClientService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.isLoading$ = this.clientService.isLoading$;
  }

  ngOnInit(): void {
    const routeSub = this.route.paramMap.subscribe((params) => {
      const clientId = params.get('clientId');
      if (clientId) {
        this.fetchClientDetails(clientId);
      }
    });
    this.unsubscribe.push(routeSub);
  }

  ngAfterViewInit(): void {}

  fetchClientDetails(clientId: string): void {
    const clientSub = this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.clientData = client;
        this.personId = this.clientData.person?.id ?? '';
        this.clientId = this.clientData.id ?? '';

        if (this.clientData.person?.birthDate) {
          this.formattedBirthDate = new Date(this.clientData.person.birthDate)
            .toISOString()
            .split('T')[0];
        }

        // 🔹 Load buyers only if they haven't been fetched before
        if (!this.buyers.length) {
          this.loadBuyers();
        } else {
          this.processSelectedBuyers();
        }

        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching client details:', err);
      },
    });

    this.unsubscribe.push(clientSub);
  }

  loadBuyers(): void {
    if (this.buyers.length) {
      // If buyers are already loaded, process selected ones without fetching again
      this.processSelectedBuyers();
      return;
    }

    const userSub = this.userService.getAllUsers(true, 'Comprador').subscribe({
      next: (users: IReadUsersModel[]) => {
        this.buyers = users;
        this.processSelectedBuyers(); // Process selected buyers separately
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });

    this.unsubscribe.push(userSub);
  }

  setActiveTab(tab: Tabs) {
    this.activeTab = tab;
  }

  saveClient() {
    if (this.clientForm.invalid || !this.clientData) {
      return;
    }

    const payload: ICreateUpdateClientModel = {
      buyersItBelongs: this.selectedBuyers.map((buyer) => buyer.id),
      person: this.clientData.person,
    };

    const updateSub = this.clientService
      .updateClient(this.clientData.id, payload)
      .subscribe({
        next: () => {
          this.showSuccessAlert();
        },
        error: (error) => {
          console.error('Error updating broker', error);
          this.showErrorAlert(error);
        },
      });

    this.unsubscribe.push(updateSub);
  }

  goBack(): void {
    this.router.navigate(['clients']);
  }

  private processSelectedBuyers(): void {
    // 🔹 Extract selected buyer IDs from the client data
    const selectedBuyerIds = new Set(
      (this.clientData?.buyersItBelongs as string[]) ?? []
    );

    // 🔹 Separate selected buyers from the rest
    this.selectedBuyers = this.buyers.filter((buyer) =>
      selectedBuyerIds.has(buyer.id)
    );
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
