import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Observable } from 'rxjs';
import { DataTablesResponse, IUserModel, UserService } from 'src/app/_fake/services/user-service';
import { SweetAlertOptions } from 'sweetalert2';
import moment from 'moment';
import { IRoleModel, RoleService } from 'src/app/_fake/services/role.service';
import { Config } from 'datatables.net';
import {PaymentInfoModel} from "../../../shared/models/paymentInfo.model";

@Component({
  selector: 'app-payment-information',
  templateUrl: './payment-information.component.html',
})
export class PaymentInformationComponent implements OnInit, AfterViewInit, OnDestroy {

  isCollapsed1 = false;
  isLoading = false;

  mockPaymentData: PaymentInfoModel[] = [
    {
      bankName: 'Banco Nacional',
      accountName: 'Cuenta Principal',
      accountNumber: '**** 1234',
      identification: 'J-123456789',
      mobilePhone: '0412-5555555',
      email: 'finanzas@empresa.com',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      bankName: 'Banco Internacional',
      accountName: 'Cuenta Secundaria',
      accountNumber: '**** 5678',
      identification: 'J-987654321',
      mobilePhone: '0416-8888888',
      email: 'contabilidad@empresa.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  datatableConfig: Config = {
    serverSide: false,
    data: this.mockPaymentData,
    columns: [
      {
        title: 'Banco',
        data: 'accountName', // Usamos accountName para las iniciales
        render: (data, type, full) => {
          const colorClasses = ['success', 'info', 'warning', 'danger'];
          const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
          const initials = data[0]?.toUpperCase() || '-';

          const symbolLabel = `
            <div class="symbol-label fs-3 bg-light-${randomColorClass} text-${randomColorClass}">
              ${initials}
            </div>
          `;

          const accountInfo = `
            <div class="d-flex flex-column" data-action="view" data-id="${full.id}">
              <span class="text-gray-800 text-hover-primary mb-1">${full.bankName}</span>
              <small>${data}</small>
            </div>
          `;

          return `
            <div class="symbol symbol-circle symbol-50px overflow-hidden me-3">
              ${symbolLabel}
            </div>
            ${accountInfo}
          `;
        }
      },
      {
        title: 'Identificación',
        data: 'identification',
        render: (data) => data?.toUpperCase() || ''
      },
    ],
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    }
  };

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  paymentInfoModel: PaymentInfoModel = {} as PaymentInfoModel;

  @ViewChild('noticeSwal') noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  constructor(private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }

  delete(id: number) {
    this.mockPaymentData = this.mockPaymentData.filter(item => item.identification !== id.toString());
    this.reloadEvent.emit(true);
  }

  edit(id: number) {
    const foundItem = this.mockPaymentData.find(item => item.identification === id.toString());
    this.paymentInfoModel = foundItem ? { ...foundItem } : {} as PaymentInfoModel;
  }

  create() {
    this.paymentInfoModel = {} as PaymentInfoModel;
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm.invalid) return;

    this.isLoading = true;

    if (this.paymentInfoModel.identification) {
      const index = this.mockPaymentData.findIndex(item => item.identification === this.paymentInfoModel.identification);
      this.mockPaymentData[index] = this.paymentInfoModel;
    } else {
      this.paymentInfoModel.identification = (this.mockPaymentData.length + 1).toString();
      this.mockPaymentData.push(this.paymentInfoModel);
    }

    this.isLoading = false;
    this.reloadEvent.emit(true);
  }

  showAlert(swalOptions: SweetAlertOptions) {
    this.swalOptions = {
      buttonsStyling: false,
      confirmButtonText: "Ok, entendido!",
      customClass: {
        confirmButton: "btn btn-" + (swalOptions.icon === 'error' ? 'danger' : 'primary')
      },
      ...swalOptions
    };
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

  ngOnDestroy(): void {
    this.reloadEvent.unsubscribe();
  }
}
