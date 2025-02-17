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
import { PaymentInfoService } from '../services/payment-info.service';
import { UserService } from '../services/user.service';
import { PermissionService } from 'src/app/shared/services/permission.service';
import { IPaymentInfo } from 'src/app/shared/interfaces/payment-info.interface';
import { PermissionEnum } from '../../auth/interfaces/permission.interface';

@Component({
  selector: 'app-payment-information',
  templateUrl: './payment-information.component.html',
})
export class PaymentInformationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  isLoading = false;
  private subscriptions: Subscription[] = [];

  paymentData: IPaymentInfo[] = [];
  paymentInfo: IPaymentInfo = {} as IPaymentInfo;
  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  personId!: string;

  @ViewChild('noticeSwal') noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
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
    private permissionService: PermissionService,
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
  }

  ngAfterViewInit(): void {}

  // 🔹 Load Payment Info List for Person
  loadPaymentInfos(): void {
    if (!this.personId) return;

    const paymentSub = this.paymentInfoService
      .getPaymentInfosByPerson(this.personId)
      .subscribe({
        next: (data) => {
          this.paymentData = [...data];
          this.datatableConfig = {
            ...this.datatableConfig,
            data: [...this.paymentData],
          };

          this.cdr.detectChanges();
          this.reloadEvent.emit(true);
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
    const foundItem = this.paymentData.find((item) => item.id === id);
    this.paymentInfo = foundItem ? { ...foundItem } : ({} as IPaymentInfo);
  }

  // 🔹 Create a new Payment Info
  create(): void {
    this.paymentInfo = {} as IPaymentInfo;
  }

  // 🔹 Handle Form Submission
  onSubmit(event: Event, myForm: NgForm): void {
    if (myForm && myForm.invalid) {
      return;
    }

    if (!this.personId) return;

    this.paymentInfo.personId = this.personId;

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Éxito!',
      text: this.paymentInfo.id
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
        .updatePaymentInfo(this.paymentInfo.id, this.paymentInfo)
        .subscribe({
          next: (updatedInfo) => {
            const index = this.paymentData.findIndex(
              (item) => item.id === updatedInfo.id
            );
            if (index > -1) this.paymentData[index] = { ...updatedInfo };

            this.showAlert(successAlert);

            this.datatableConfig = {
              ...this.datatableConfig,
              data: [...this.paymentData],
            };

            this.cdr.detectChanges();
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
      this.paymentInfoService.createPaymentInfo(this.paymentInfo).subscribe({
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

    if (this.paymentInfo.id) {
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

  hasEditPermission(): boolean {
    return this.permissionService.hasPermission(
      'personal-profile/my-profile',
      PermissionEnum.EDIT
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
