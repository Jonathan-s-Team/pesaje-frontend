import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit, ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrokerService } from '../../services/broker.service';
import {IReadBrokerModel, IUpdateBrokerModel} from '../../interfaces/broker.interface';
import {NgForm} from "@angular/forms";
import Swal, {SweetAlertOptions} from "sweetalert2";

type Tabs = 'Details' | 'Payment Info';

@Component({
  selector: 'app-broker-details',
  templateUrl: './broker-details.component.html',
  styleUrls: ['./broker-details.component.scss'],
})
export class BrokerDetailsComponent implements OnInit, AfterViewInit {

  @ViewChild('brokerForm') brokerForm!: NgForm;
  isCollapsed: boolean = false;
  brokerData: IReadBrokerModel = {
    id: '',
    deletedAt: '',
    buyerItBelongs: { id: '', fullName: '' },
    person: {
      id: '',
      names: '',
      lastNames: '',
      identification: '',
      birthDate: new Date(),
      address: '',
      phone: '',
      mobilePhone: '',
      mobilePhone2: '',
      email: '',
      emergencyContactName: '',
      emergencyContactPhone: ''
    }
  };
  // Broker details object
  personId: string;
  isLoading: boolean = true; // Added loading state
  formattedBirthDate: string = '';


  activeTab: Tabs = 'Details';

  constructor(
    private brokerService: BrokerService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const brokerId = params.get('brokerId');
      if (brokerId) {
        this.fetchBrokerDetails(brokerId);
      }
    });
  }

  fetchBrokerDetails(brokerId: string): void {
    this.isLoading = true; // Start loading
    this.brokerService.getBrokerById(brokerId).subscribe({
      next: (broker) => {
        this.brokerData = broker;
        this.personId = broker.person!.id; // Extract personId from broker data
        if (broker.person.birthDate) {
          this.formattedBirthDate = new Date(broker.person.birthDate).toISOString().split('T')[0];
        }
        this.isLoading = false;
        this.changeDetectorRef.detectChanges(); // Ensure UI updates
      },
      error: (err) => {
        console.error('Error fetching broker details:', err);
        this.isLoading = false;
      },
    });
  }

  setActiveTab(tab: Tabs) {
    this.activeTab = tab;
  }

  saveBroker(){
    if (this.brokerForm.invalid || !this.brokerData) {
      return;
    }
    this.isLoading = true;

    const payload: IUpdateBrokerModel = {
      id: this.brokerData.id,
      deletedAt: this.brokerData.deletedAt,
      buyerItBelongs: this.brokerData.buyerItBelongs.id,
      person: this.brokerData.person,
    }

    this.brokerService.updateBroker(this.brokerData.id, payload).subscribe({
      next: ()=> {
        this.isLoading = false;
        this.showSuccessAlert()
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating broker', error);
        this.showErrorAlert(error);
      }
    });
  }

  get brokerPerson() {
    return this.brokerData.person!;
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
      html: `<strong>${error.message || 'Ocurrió un error inesperado.'}</strong>`,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33',
      showCloseButton: true,
      focusConfirm: false,
    };
    Swal.fire(options);
  }

  ngAfterViewInit(): void {}
}
