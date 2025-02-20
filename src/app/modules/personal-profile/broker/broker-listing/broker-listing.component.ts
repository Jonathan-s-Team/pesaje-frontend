import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import {NgForm} from '@angular/forms';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {Observable} from 'rxjs';
import {DataTablesResponse, IUserModel, UserService} from 'src/app/_fake/services/user-service';
import {SweetAlertOptions} from 'sweetalert2';
import {Config} from 'datatables.net';
import {BrokerService, IBroker} from "../../services/broker.service";
import {IPerson} from "../../../../shared/interfaces/person.interface";
import {AuthService} from "../../../auth";
import {PaymentInfoService} from "../../services/payment-info.service";
import {IPaymentInfo} from "../../../../shared/interfaces/payment-info.interface";

@Component({
    selector: 'app-broker-listing',
    templateUrl: './broker-listing.component.html',
    styleUrls: ['./broker-listing.component.scss']
})
export class BrokerListingComponent implements OnInit, AfterViewInit, OnDestroy {

    isLoading = false;
    activeTab: string = 'info';
    users: DataTablesResponse;

    datatableConfig: Config = {};

    // Reload emitter inside datatable
    reloadEvent: EventEmitter<boolean> = new EventEmitter();
    brokerModel: IBroker;
    paymentInfoModel: IPaymentInfo;

    brokers: IPerson[] = [];

    // Single model
    aUser: Observable<IUserModel>;
    userModel: IUserModel = {id: 0, name: '', email: '', role: ''};

    @ViewChild('noticeSwal')
    noticeSwal!: SwalComponent;

    swalOptions: SweetAlertOptions = {};

    constructor(private brokerService: BrokerService, private apiService: UserService, private cdr: ChangeDetectorRef, private authService: AuthService, private paymentInfoService: PaymentInfoService) {
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
debugger;
                        if (this.brokers.length === 0) {
                            this.swalOptions = {
                                icon: 'info',
                                title: 'Sin Brókers',
                                text: 'No se encontraron brókers para este usuario.',
                                confirmButtonText: 'Aceptar',
                                customClass: {
                                    confirmButton: 'btn btn-primary'
                                }
                            };
                            this.cdr.detectChanges();
                            this.noticeSwal.fire();
                        }

                        callback({
                            data: this.brokers
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
                                confirmButton: 'btn btn-danger'
                            }
                        };
                        this.cdr.detectChanges();
                        this.noticeSwal.fire();

                        callback({
                            data: []
                        });
                    }
                });
            },
            columns: [
                {
                    title: 'Nombre Completo',
                    data: 'person.names',
                    render: function (data, type, full) {
                        const colorClasses = ['success', 'info', 'warning', 'danger'];
                        const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];
                        const initials = data && data.length > 0 ? data[0].toUpperCase() : '?';
                        const symbolLabel = `
            <div class="symbol-label fs-3 bg-light-${randomColorClass} text-${randomColorClass}">
              ${initials}
            </div>
          `;

                        const nameAndEmail = `
                <div class="d-flex flex-column" data-action="view" data-id="${full.id}">
                  <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">${data || 'Sin nombre'} ${full.person.lastNames || ''}</a>
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
                    }
                },
                {
                    title: 'Identificación', data: 'person.identification', render: function (data) {
                        return data ? data : '-';
                    }
                },
                {
                    title: 'Teléfono Celular', data: 'person.mobilePhone', render: function (data) {
                        return data ? data : '-';
                    }
                },
                {
                    title: 'Comprador', data: 'buyerItBelongs', render: function (data) {
                        return data ? data : '-';
                    }
                }
            ],
            createdRow: function (row, data, dataIndex) {
                $('td:eq(0)', row).addClass('d-flex align-items-center');
            }
        };
    }


    delete(id: number) {
        this.apiService.deleteUser(id).subscribe(() => {
            this.reloadEvent.emit(true);
        });
    }

    edit(id: number) {
        this.aUser = this.apiService.getUser(id);
        this.aUser.subscribe((user: IUserModel) => {
            this.userModel = user;
        });
    }

    create() {
        this.brokerModel = {
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
                emergencyContactPhone: ''
            },
            buyerItBelongs: this.authService.currentUserValue!.id
        };
    }

    onSubmit(event: Event, createBrokerForm: NgForm) {
        event.preventDefault();

        if (createBrokerForm.invalid) {
            return;
        }

        this.isLoading = true;
        this.brokerModel.buyerItBelongs = this.authService.currentUserValue!.id;

        const successAlert: SweetAlertOptions = {
            icon: 'success',
            title: '¡Éxito!',
            text: '¡Bróker creado exitosamente!',
        };
        const errorAlert: SweetAlertOptions = {
            icon: 'error',
            title: '¡Error!',
            text: 'Hubo un problema al crear el bróker.',
        };

        const completeFn = () => {
            this.isLoading = false;
        };

        const createPaymentInfoFn = (personId: string)=> {
          this.paymentInfoModel.person.id = personId;

          this.paymentInfoService.createPaymentInfo(this.paymentInfoModel).subscribe({
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
              }
          });
        };

        const createBrokerFn = () => {
            this.brokerService.createBroker(this.brokerModel).subscribe({
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
        };

        createBrokerFn();
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
        this.swalOptions = Object.assign({
            buttonsStyling: false,
            confirmButtonText: "Ok, got it!",
            customClass: {
                confirmButton: "btn btn-" + style
            }
        }, swalOptions);
        this.cdr.detectChanges();
        this.noticeSwal.fire();
    }

    ngOnDestroy(): void {
        this.reloadEvent.unsubscribe();
    }
}
