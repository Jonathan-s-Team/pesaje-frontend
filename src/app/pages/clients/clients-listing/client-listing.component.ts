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
import { Subscription } from 'rxjs';
import { SweetAlertOptions } from 'sweetalert2';
import { Config } from 'datatables.net';
import { AuthService } from 'src/app/modules/auth';
import { PERMISSION_ROUTES } from 'src/app/constants/routes.constants';
import {
  ICreateUpdateClientModel,
  IReadClientModel,
} from 'src/app/modules/shared/interfaces/client.interface';
import { IRoleModel } from 'src/app/modules/auth/interfaces/role.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { IPaymentInfoModel } from 'src/app/modules/shared/interfaces/payment-info.interface';
import { IPersonModel } from 'src/app/modules/shared/interfaces/person.interface';
import { ClientService } from '../../../modules/shared/services/client.service';
import { UserService } from 'src/app/modules/personal-profile/services/user.service';
import { IReadUsersModel } from 'src/app/modules/personal-profile/interfaces/user.interface';

@Component({
  selector: 'app-client-listing',
  templateUrl: './client-listing.component.html',
})
export class ClientListingComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  PERMISSION_ROUTES = PERMISSION_ROUTES;

  isLoading = false;
  isOnlyBuyer = false;

  buyers: IReadUsersModel[];
  selectedBuyers: IReadUsersModel[] = [];

  roles: IRoleModel[];

  private unsubscribe: Subscription[] = [];

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  createClientModel: ICreateUpdateClientModel = {
    person: {} as IPersonModel,
    buyersItBelongs: [],
  };

  clients: IReadClientModel[] = [];

  // Single model
  // aBroker: Observable<IReadBrokerModel>;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [],
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
                } ${full.person?.lastNames || ''}</a>
                <span>${full.person?.email || 'Sin correo'}</span>
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
    ],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
    },
    createdRow: function (row, data, dataIndex) {
      $('td:eq(0)', row).addClass('d-flex align-items-center');
    },
  };

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.roles = this.authService.currentUserValue?.roles!;

    this.isOnlyBuyer =
      this.roles.length > 0 &&
      this.roles.every((role) => role.name === 'Comprador');

    this.loadUsers();
    this.loadBuyers();
  }

  loadBuyers() {
    const userSub = this.userService.getAllUsers(true, 'Comprador').subscribe({
      next: (users: IReadUsersModel[]) => {
        this.buyers = users;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
    this.unsubscribe.push(userSub);
  }

  loadUsers(): void {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;

    const clientObservable = !this.isOnlyBuyer
      ? this.clientService.getAllClients(true)
      : this.clientService.getClientsByUser(userId!);

    const clientSub = clientObservable.subscribe({
      next: (data) => {
        this.clients = data;
        this.datatableConfig = {
          ...this.datatableConfig,
          data: [...this.clients],
        };

        this.cdr.detectChanges();
        this.reloadEvent.emit(true);
      },
      error: () => {
        this.showAlert({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información de clientes.',
        });
      },
    });

    this.unsubscribe.push(clientSub);
  }

  delete(id: string): void {
    const deleteSub = this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.clients = this.clients.filter((item) => item.id !== id);
        this.reloadEvent.emit(true);
      },
      error: () => {
        this.showAlert({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el cliente.',
        });
      },
    });
    this.unsubscribe.push(deleteSub);
  }

  edit(id: string) {
    const currentUrl = this.router.url;
    this.router.navigate([`${currentUrl}/${id}`]);
  }

  create() {
    this.createClientModel = {
      person: {} as IPersonModel,
    } as ICreateUpdateClientModel;
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    if (this.isOnlyBuyer) {
      this.createClientModel.buyersItBelongs = [
        this.authService.currentUserValue!.id,
      ];
    } else {
      this.createClientModel.buyersItBelongs = this.selectedBuyers.map(
        (buyer) => buyer.id
      );
    }

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Éxito!',
      text: '¡Bróker creado exitosamente!',
    };

    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: 'Hubo un problema al guardar los cambios.',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    const createFn = () => {
      this.clientService.createClient(this.createClientModel).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.loadUsers();
        },
        error: (error) => {
          errorAlert.text = 'No se pudo crear el cliente.';
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    createFn();
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

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
    this.reloadEvent.unsubscribe();
  }
}
