import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrokerService } from '../../services/broker.service';
import {
  BuyerModel,
  IReadBrokerModel,
  IUpdateBrokerModel,
} from '../../interfaces/broker.interface';
import { NgForm } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import { DateUtilsService } from 'src/app/utils/date-utils.service';
import { AlertService } from 'src/app/utils/alert.service';

type Tabs = 'Details' | 'Payment Info';

@Component({
  selector: 'app-broker-details',
  templateUrl: './broker-details.component.html',
  styleUrls: ['./broker-details.component.scss'],
})
export class BrokerDetailsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  PERMISSION_ROUTE = PERMISSION_ROUTES.PERSONAL_PROFILE.BROKERS;

  @ViewChild('brokerForm') brokerForm!: NgForm;

  isLoading$: Observable<boolean>;
  activeTab: Tabs = 'Details';

  brokerData: IReadBrokerModel = {} as IReadBrokerModel;
  personId: string = '';
  formattedBirthDate: string = '';

  /** Stores all active subscriptions */
  private unsubscribe: Subscription[] = [];

  constructor(
    private brokerService: BrokerService,
    private dateUtils: DateUtilsService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
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
        this.brokerData = broker;
        this.personId = broker.person?.id ?? '';

        if (this.brokerData.person?.birthDate) {
          this.formattedBirthDate = this.dateUtils.formatISOToDateInput(
            this.brokerData.person.birthDate
          );
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
    if (this.brokerForm.invalid || !this.brokerData) {
      return;
    }

    const payload: IUpdateBrokerModel = {
      id: this.brokerData.id,
      deletedAt: this.brokerData.deletedAt,
      buyerItBelongs: (this.brokerData.buyerItBelongs as BuyerModel).id,
      person: this.brokerData.person,
    };

    const updateSub = this.brokerService
      .updateBroker(this.brokerData.id, payload)
      .subscribe({
        next: () => {
          this.alertService.showAlert({
            title: '¡Éxito!',
            text: 'Los cambios se guardaron correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 5000,
            timerProgressBar: true,
          });
        },
        error: (error) => {
          console.error('Error updating broker', error);
          this.alertService.showAlert({
            title: 'Error',
            html: `<strong>${
              error.message || 'Ocurrió un error inesperado.'
            }</strong>`,
            icon: 'error',
            confirmButtonText: 'Entendido',
            focusConfirm: false,
          });
        },
      });

    this.unsubscribe.push(updateSub);
  }

  onChangeBirthDate(value: string) {
    const convertedDate = this.dateUtils.convertLocalDateToUTC(value);
    this.brokerData.person.birthDate =
      convertedDate === '' ? null : convertedDate;
  }

  onChangeEmail(value: string): void {
    this.brokerData.person.email = value.trim() === '' ? null : value;
  }

  goBack(): void {
    this.router.navigate(['personal-profile', 'brokers']);
  }

  /** 🔴 Unsubscribe from all subscriptions to avoid memory leaks */
  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
