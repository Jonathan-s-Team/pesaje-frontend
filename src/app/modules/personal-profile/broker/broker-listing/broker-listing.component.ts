import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {Observable} from 'rxjs';
import {
  DataTablesResponse,
  IUserModel,
  UserService,
} from 'src/app/_fake/services/user-service';
import {SweetAlertOptions} from 'sweetalert2';
import {Config} from 'datatables.net';
import {BrokerService, IBroker} from '../../services/broker.service';
import {IPersonModel} from '../../../../shared/interfaces/person.interface';
import {AuthService} from '../../../auth';
import {PaymentInfoService} from '../../services/payment-info.service';
import {IPaymentInfoModel} from '../../../../shared/interfaces/payment-info.interface';

@Component({
  selector: 'app-broker-listing',
  templateUrl: './broker-listing.component.html',
  styleUrls: ['./broker-listing.component.scss'],
})
export class BrokerListingComponent
  implements OnInit, AfterViewInit, OnDestroy {
  isLoading = false;
  isEditing = false;
  activeTab: string = 'info';
  users: DataTablesResponse;

  datatableConfig: Config = {};

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();
  brokerModel: IBroker = {
    deletedAt:'',
    id: '',
    person: {
      photo: '',
      names: '',
      lastNames: '',
      identification: '',
      birthDate: '',
      address: '',
      phone: '',
      mobilePhone: '',
      mobilePhone2: '',
      email: '',
      emergencyContactName: '',
      emergencyContactPhone: ''
    },
    buyerItBelongs: {
      id: '',
      fullName: ''
    }
  };

  paymentInfoModel: IPaymentInfoModel = {
    id: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    identification: '',
    mobilePhone: '',
    email: '',
    person: {
      id: '',
      names: '',
      lastNames: '',
      identification: '',
      birthDate: new Date(),
      address: '',
      phone: '',
      mobilePhone: '',
      email: '',
      emergencyContactName: '',
      emergencyContactPhone: ''
    },
    personId: '',
    deletedAt: undefined
  };

  brokers: IPersonModel[] = [];

  // Single model
  aBroker: Observable<IBroker>;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  constructor(
    private brokerService: BrokerService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private paymentInfoService: PaymentInfoService
  ) {
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    const userId = this.authService.currentUserValue!.id;
    this.datatableConfig = {
      serverSide: false,
      ajax: (dataTablesParameters: any, callback) => {
        this.isLoading = true;
        this.brokerService.getBrokersByUser(userId).subscribe({
          next: (brokers) => {
            this.isLoading = false;
            this.brokers = brokers ?? [];

            callback({
              data: this.brokers,
            });
            this.cdr.detectChanges();
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error al cargar los brókers:', error);

            this.swalOptions = {
              icon: 'error',
              title: 'Error al cargar datos',
              text: 'Hubo un problema al cargar los brókers. Inténtalo más tarde.',
              confirmButtonText: 'Aceptar',
              customClass: {
                confirmButton: 'btn btn-danger',
              },
            };
            this.cdr.detectChanges();
            this.noticeSwal.fire();

            callback({
              data: [],
            });
          },
        });
      },
      columns: [
        {
          title: 'Nombre Completo',
          data: 'person.names',
          render: function (data, type, full) {
            const colorClasses = ['success', 'info', 'warning', 'danger'];
            const randomColorClass =
              colorClasses[Math.floor(Math.random() * colorClasses.length)];
            const initials =
              data && data.length > 0 ? data[0].toUpperCase() : '?';
            const symbolLabel = `
            <div class="symbol-label fs-3 bg-light-${randomColorClass} text-${randomColorClass}">
              ${initials}
            </div>
          `;

            const nameAndEmail = `
                <div class="d-flex flex-column" data-action="view" data-id="${
              full.id
            }">
                  <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">${
              data || 'Sin nombre'
            } ${full.person.lastNames || ''}</a>
                  <span>${full.person.email || 'Sin correo'}</span>
                </div>
            `;

            return `
                <div class="symbol symbol-circle symbol-50px overflow-hidden me-3" data-action="view" data-id="${full.id}">
                  <a href="javascript:;">
                    ${symbolLabel}
                  </a>
                </div>
                ${nameAndEmail}
            `;
          },
        },
        {
          title: 'Identificación',
          data: 'person.identification',
          render: function (data) {
            return data ? data : '-';
          },
        },
        {
          title: 'Teléfono Celular',
          data: 'person.mobilePhone',
          render: function (data) {
            return data ? data : '-';
          },
        },
        {
          title: 'Comprador',
          data: 'buyerItBelongs.fullName',
          render: function (data) {
            return data ? data : '-';
          },
        },
      ],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
      },
      createdRow: function (row, data, dataIndex) {
        $('td:eq(0)', row).addClass('d-flex align-items-center');
      },
    };
  }

  delete(id: string) {
    this.brokerService.deleteBroker(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  originalBrokerModel: IBroker | null = null;
  originalPaymentInfoModel: IPaymentInfoModel | null = null;

  hasBrokerChanges(): boolean {
    return JSON.stringify(this.brokerModel) !== JSON.stringify(this.originalBrokerModel);
  }

  hasPaymentInfoChanges(): boolean {
    return JSON.stringify(this.paymentInfoModel) !== JSON.stringify(this.originalPaymentInfoModel);
  }

  edit(id: string) {
    this.isEditing = true;
    this.aBroker = this.brokerService.getBrokerById(id);
    this.aBroker.subscribe((response: IBroker) => {
      if (response) {
        this.brokerModel = response;
        debugger;
        this.originalBrokerModel = JSON.parse(JSON.stringify(response));

        if (this.brokerModel.person.birthDate) {
          this.brokerModel.person.birthDate = this.formatDate(this.brokerModel.person.birthDate);
        }

        this.paymentInfoService.getPaymentInfosByPerson(this.brokerModel.person.id!).subscribe({
          next: (paymentInfos) => {
            if (paymentInfos && paymentInfos.length > 0) {
              this.paymentInfoModel = paymentInfos[0];
              this.originalPaymentInfoModel = JSON.parse(JSON.stringify(paymentInfos[0]));
            }
          },
          error: (err) => {
            console.error('Error al cargar información de pago:', err);
          }
        });
      } else {
        console.error("No se encontró el bróker o no tiene información de persona.");
      }
    });
  }

  create() {
    this.isEditing = false;
    this.brokerModel = {
      deletedAt: '',
      id: '',
      person: {
        photo: '0',
        names: '',
        lastNames: '',
        identification: '',
        birthDate: '',
        address: '',
        phone: '',
        mobilePhone: '',
        mobilePhone2: '',
        email: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
      },
      buyerItBelongs: {
        id: this.authService.currentUserValue!.id,
        fullName: ''
      }
    };
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isPaymentInfoComplete(): boolean {
    return !!(
      this.paymentInfoModel.bankName &&
      this.paymentInfoModel.accountName &&
      this.paymentInfoModel.accountNumber &&
      this.paymentInfoModel.identification &&
      this.paymentInfoModel.mobilePhone &&
      this.paymentInfoModel.email
    );
  }

  onSubmit(event: Event, createBrokerForm: NgForm) {
    event.preventDefault();

    if (createBrokerForm.invalid) {
      return;
    }

    this.isLoading = true;
    debugger;
    this.brokerModel.buyerItBelongs.id = this.authService.currentUserValue!.id;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Éxito!',
      text: this.isEditing ? '¡Bróker actualizado exitosamente!' : '¡Bróker creado exitosamente!',
    };

    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: 'Hubo un problema al guardar los cambios.',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    const updatePaymentInfoFn = () => {
      if (this.hasPaymentInfoChanges()) {
        this.paymentInfoService.updatePaymentInfo(this.paymentInfoModel.id, this.paymentInfoModel)
          .subscribe({
            next: () => {
              this.showAlert({
                icon: 'success',
                title: '¡Éxito!',
                text: '¡Información de pago actualizada exitosamente!',
              });
              this.reloadEvent.emit(true);
            },
            error: (error) => {
              this.showAlert({
                icon: 'error',
                title: '¡Error!',
                text: 'Hubo un problema al actualizar la información de pago.',
              });
              this.isLoading = false;
            },
          });
      }
    };

    const createPaymentInfoFn = (personId: string) => {
      debugger;
      if (this.hasPaymentInfoChanges()) {
        this.paymentInfoModel.person.id = personId;
        this.paymentInfoService.createPaymentInfo(this.paymentInfoModel)
          .subscribe({
            next: () => {
              this.showAlert({
                icon: 'success',
                title: '¡Éxito!',
                text: '¡Información de pago guardada exitosamente!',
              });
              this.reloadEvent.emit(true);
            },
            error: (error) => {
              this.showAlert({
                icon: 'error',
                title: '¡Error!',
                text: 'Hubo un problema al guardar la información de pago.',
              });
              this.isLoading = false;
            },
          });
      }
    };

    if (this.isEditing) {
      if (this.hasBrokerChanges()) {
        this.brokerService.updateBroker(this.brokerModel.id!, this.brokerModel)
          .subscribe({
            next: () => {
              this.showAlert(successAlert);
              this.reloadEvent.emit(true);
              createBrokerForm.resetForm();
              this.create();
              updatePaymentInfoFn();
            },
            error: (error) => {
              errorAlert.text = this.extractText(error.error);
              this.showAlert(errorAlert);
              this.isLoading = false;
            },
            complete: completeFn,
          });
      } else {
        updatePaymentInfoFn();
      }
    } else {
      this.brokerService.createBroker(this.brokerModel)
        .subscribe({
          next: (createdBroker) => {
            this.showAlert(successAlert);
            this.reloadEvent.emit(true);
            createBrokerForm.resetForm();
            this.create();
            if (this.activeTab === 'payment') {
              createPaymentInfoFn(createdBroker.message);
            }
          },
          error: (error) => {
            errorAlert.text = this.extractText(error.error);
            this.showAlert(errorAlert);
            this.isLoading = false;
          },
          complete: completeFn,
        });
    }
  }


  extractText(obj: any): string {
    var textArray: string[] = [];

    for (var key in obj) {
      if (typeof obj[key] === 'string') {
        // If the value is a string, add it to the 'textArray'
        textArray.push(obj[key]);
      } else if (typeof obj[key] === 'object') {
        // If the value is an object, recursively call the function and concatenate the results
        textArray = textArray.concat(this.extractText(obj[key]));
      }
    }

    // Use a Set to remove duplicates and convert back to an array
    var uniqueTextArray = Array.from(new Set(textArray));

    // Convert the uniqueTextArray to a single string with line breaks
    var text = uniqueTextArray.join('\n');

    return text;
  }

  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign(
      {
        buttonsStyling: false,
        confirmButtonText: 'Ok, got it!',
        customClass: {
          confirmButton: 'btn btn-' + style,
        },
      },
      swalOptions
    );
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }
  closeModal(modal: any) {
    modal.dismiss('Cross click');
    this.resetPaymentInfoModel();
  }

  resetPaymentInfoModel() {
    this.paymentInfoModel = {
      id: '',
      bankName: '',
      accountName: '',
      accountNumber: '',
      identification: '',
      mobilePhone: '',
      email: '',
      person: {
        id: '',
        names: '',
        lastNames: '',
        identification: '',
        birthDate: new Date(),
        address: '',
        phone: '',
        mobilePhone: '',
        email: '',
        emergencyContactName: '',
        emergencyContactPhone: ''
      },
      personId: '',
      deletedAt: undefined
    };
  }


  ngOnDestroy(): void {
    this.reloadEvent.unsubscribe();
  }
}
