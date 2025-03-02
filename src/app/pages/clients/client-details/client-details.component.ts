import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Observable, Subscription } from 'rxjs';
import {ICreateUpdateClientModel, IReadClientModel} from "../../../modules/shared/interfaces/client.interface";
import {ClientService} from "../../../modules/shared/services/client.service";
import {UserService} from "../../../modules/personal-profile/services/user.service";

type Tabs = 'Details' | 'Shrimp Farms' | 'Payment Info' ;

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
})
export class ClientDetailsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('clientForm') clientForm!: NgForm;

  isLoading$: Observable<boolean>;
  activeTab: Tabs = 'Details';

  clientData: IReadClientModel = {} as IReadClientModel;
  personId: string = '';
  formattedBirthDate: string = '';

  /** Stores all active subscriptions */
  private unsubscribe: Subscription[] = [];

  constructor(
    private clientService: ClientService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private userService: UserService
  ) {
    this.isLoading$ = this.clientService.isLoading$;
  }

  ngOnInit(): void {
    const routeSub = this.route.paramMap.subscribe((params) => {
      const clientId = params.get('clientId');
      if (clientId) {
        this.fetchBrokerDetails(clientId);
      }
    });

    this.unsubscribe.push(routeSub);
  }

  ngAfterViewInit(): void {}

  fetchBrokerDetails(clientId: string): void {
    const userObservable = this.userService.getAllUsers(true);

    const clientSub = this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.clientData = client;
        this.personId = client.person?.id ?? '';

        if (this.clientData.person?.birthDate) {
          this.formattedBirthDate = new Date(this.clientData.person.birthDate)
            .toISOString()
            .split('T')[0];
        }

        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching broker details:', err);
      },
    });

    this.unsubscribe.push(clientSub);
  }

  setActiveTab(tab: Tabs) {
    this.activeTab = tab;
  }

  saveBroker() {
    if (this.clientForm.invalid || !this.clientData) {
      return;
    }

    const payload: ICreateUpdateClientModel = {
      buyersItBelongs: this.clientData.buyersItBelongs.map(buyer => buyer.id),
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
