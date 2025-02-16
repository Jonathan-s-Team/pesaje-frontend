import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Observable, Subscription } from 'rxjs';
import { SweetAlertOptions } from 'sweetalert2';
import { Config } from 'datatables.net';
import { PaymentInfoModel } from '../../../shared/models/paymentInfo.model';
import { PaymentInfoService } from '../services/payment-info.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-payment-information',
  templateUrl: './payment-information.component.html',
})
export class PaymentInformationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  isLoading = false;
  private subscriptions: Subscription[] = [];

  paymentData: PaymentInfoModel[] = [];
  paymentInfoModel: PaymentInfoModel = {} as PaymentInfoModel;
  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  personId!: string;

  @ViewChild('noticeSwal') noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  datatableConfig: Config = {
    serverSide: false,
    data: [], // ✅ Ensure default is an empty array
    columns: [
      {
        title: 'ID',
        data: 'id',
        visible: false,
      },
      {
        title: 'Cuenta #',
        data: 'accountNumber',
        render: (data, type, full) =>
          `${full?.bankName} - ${data?.toUpperCase()}`,
      },
      {
        title: 'Nombre',
        data: 'accountName',
        render: (data) => `${data?.toUpperCase()}`,
      },
      {
        title: 'Identificación',
        data: 'identification',
        render: (data) => `${data?.toUpperCase()}`,
      },
    ],
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
    },
  };

  constructor(
    private paymentInfoService: PaymentInfoService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to current user to get `personId`
    const userSub = this.userService.user$.subscribe((user) => {
      if (user?.person?.id) {
        this.personId = user.person.id;
        this.loadPaymentInfos();
      }
    });
    this.subscriptions.push(userSub);

    this.reloadEvent.subscribe(() => {
      console.log(
        '🔹 DataTable reload event triggered',
        this.datatableConfig.data
      );
    });
  }

  ngAfterViewInit(): void {}

  // 🔹 Load Payment Info List for Person
  loadPaymentInfos(): void {
    if (!this.personId) return;

    const paymentSub = this.paymentInfoService
      .getPaymentInfosByPerson(this.personId)
      .subscribe({
        next: (data) => {
          this.paymentData = data.length ? data : []; // Ensure it's an array
          this.datatableConfig = {
            ...this.datatableConfig,
            data: this.paymentData,
          }; // Update datatable config
          this.cdr.detectChanges();
          this.reloadEvent.emit(true); // Reload only if data is available
        },
        error: () => {
          this.showAlert({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información de pago.',
          });
        },
      });
    this.subscriptions.push(paymentSub);
  }

  // 🔹 Delete a Payment Info
  delete(id: any): void {
    const deleteSub = this.paymentInfoService.deletePaymentInfo(id).subscribe({
      next: () => {
        this.paymentData = this.paymentData.filter((item) => item.id !== id);
        this.reloadEvent.emit(true);
      },
      error: () => {
        this.showAlert({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la información de pago.',
        });
      },
    });
    this.subscriptions.push(deleteSub);
  }

  // 🔹 Edit Payment Info
  edit(id: any): void {
    console.log('🔹 Event received in edit:', id, 'Type:', typeof id);
    const foundItem = this.paymentData.find((item) => item.id === id);
    this.paymentInfoModel = foundItem
      ? { ...foundItem }
      : ({} as PaymentInfoModel);
  }

  // 🔹 Create a new Payment Info
  create(): void {
    this.paymentInfoModel = {} as PaymentInfoModel;
  }

  // 🔹 Handle Form Submission
  onSubmit(event: Event, myForm: NgForm): void {
    if (myForm && myForm.invalid) {
      return;
    }

    if (!this.personId) return;

    this.paymentInfoModel.personId = this.personId;

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Éxito!',
      text: this.paymentInfoModel.id
        ? 'Información de pago actualizada correctamente.'
        : 'Información de pago creada correctamente.',
    };

    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: 'Error',
      text: '',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    const updateFn = () => {
      this.paymentInfoService
        .updatePaymentInfo(this.paymentInfoModel.id, this.paymentInfoModel)
        .subscribe({
          next: (updatedInfo) => {
            const index = this.paymentData.findIndex(
              (item) => item.id === updatedInfo.id
            );
            if (index > -1) this.paymentData[index] = updatedInfo;

            this.showAlert(successAlert);
            this.reloadEvent.emit(true);
          },
          error: (error) => {
            errorAlert.text = 'No se pudo actualizar la información de pago.';
            this.showAlert(errorAlert);
            this.isLoading = false;
          },
          complete: completeFn,
        });
    };

    const createFn = () => {
      this.paymentInfoService
        .createPaymentInfo(this.paymentInfoModel)
        .subscribe({
          next: () => {
            this.showAlert(successAlert);
            this.loadPaymentInfos(); // ✅ Reload the list after creation
          },
          error: (error) => {
            errorAlert.text = 'No se pudo crear la información de pago.';
            this.showAlert(errorAlert);
            this.isLoading = false;
          },
          complete: completeFn,
        });
    };

    if (this.paymentInfoModel.id) {
      updateFn();
    } else {
      createFn();
    }
  }

  // 🔹 Show SweetAlert Message
  showAlert(swalOptions: SweetAlertOptions): void {
    this.swalOptions = {
      buttonsStyling: false,
      confirmButtonText: 'Ok, entendido!',
      customClass: {
        confirmButton:
          'btn btn-' + (swalOptions.icon === 'error' ? 'danger' : 'primary'),
      },
      ...swalOptions,
    };
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
