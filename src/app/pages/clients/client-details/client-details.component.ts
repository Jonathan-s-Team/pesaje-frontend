import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrokerService } from '../../services/broker.service';
import {
  IReadBrokerModel,
  IUpdateBrokerModel,
} from '../../interfaces/broker.interface';
import { NgForm } from '@angular/forms';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Observable, Subscription } from 'rxjs';
import {IReadClientModel} from "../../../modules/shared/interfaces/client.interface";

type Tabs = 'Details' | 'Payment Info';

@Component({
  selector: 'app-user-details',
  templateUrl: './client-details.component.html',
})
export class ClientDetailsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('brokerForm') brokerForm!: NgForm;

  isLoading$: Observable<boolean>;
  activeTab: Tabs = 'Details';

  userData: IReadClientModel = {} as IReadClientModel;
  personId: string = '';
  formattedBirthDate: string = '';

  /** Stores all active subscriptions */
  private unsubscribe: Subscription[] = [];

  constructor(
    private brokerService: BrokerService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.isLoading$ = this.brokerService.isLoading$;
  }

  ngOnInit(): void {
    const routeSub = this.route.paramMap.subscribe((params) => {
      const brokerId = params.get('brokerId');
      if (brokerId) {
        this.fetchBrokerDetails(brokerId);
      }
    });

    this.unsubscribe.push(routeSub);
  }

  ngAfterViewInit(): void {}

  fetchBrokerDetails(brokerId: string): void {
    const brokerSub = this.brokerService.getBrokerById(brokerId).subscribe({
      next: (broker) => {
        this.userData = broker;
        this.personId = broker.person?.id ?? '';

        if (this.userData.person?.birthDate) {
          this.formattedBirthDate = new Date(this.userData.person.birthDate)
            .toISOString()
            .split('T')[0];
        }

        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching broker details:', err);
      },
    });

    this.unsubscribe.push(brokerSub);
  }

  setActiveTab(tab: Tabs) {
    this.activeTab = tab;
  }

  saveBroker() {
    if (this.brokerForm.invalid || !this.userData) {
      return;
    }

    const payload: IUpdateBrokerModel = {
      id: this.userData.id,
      deletedAt: this.userData.deletedAt,
      buyerItBelongs: this.userData.buyerItBelongs.id,
      person: this.userData.person,
    };

    const updateSub = this.brokerService
      .updateBroker(this.userData.id, payload)
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
