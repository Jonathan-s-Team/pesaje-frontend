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
import { AuthService } from '../../../auth';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';
import {
  ICreateBrokerModel,
} from '../../interfaces/broker.interface';
import { IRoleModel } from 'src/app/modules/auth/interfaces/role.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { IPaymentInfoModel } from 'src/app/modules/shared/interfaces/payment-info.interface';
import { IPersonModel } from 'src/app/modules/shared/interfaces/person.interface';
import {UserService} from "../../services/user.service";
import {UserModel} from 'src/app/modules/auth/models/user.model';
import {IReadUsersModel, IUpdateUserModel} from "../../interfaces/user.interface";


@Component({
  selector: 'app-broker-listing',
  templateUrl: './users-listing.component.html',
})
export class UsersListingComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  PERMISSION_ROUTES = PERMISSION_ROUTES;

  isLoading = false;
  isOnlyComprador = false;

  roles: IRoleModel[];

  private unsubscribe: Subscription[] = [];

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  userModel: IUpdateUserModel = {} as IUpdateUserModel;
  users: IReadUsersModel[] = [];

  // Single model
  // aBroker: Observable<IReadBrokerModel>;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;
  swalOptions: SweetAlertOptions = {};

  datatableConfig: Config = {
    serverSide: false,
    paging: true,
    pageLength: 10,
    data: [], // ✅ Ensure default is an empty array
    columns: [
      {
        title: 'Nombre Completo',
        data: 'id',
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
        title: 'Nombre de Usuario',
        data: 'username',
        render: function (data) {
          return data ? data : '-';
        },
      },
      {
        title: 'Estado',
        data: 'deletedAt',
        render: function (data) {
          if (data) {
            return `<span class="badge bg-danger">Inactivo</span>`;
          } else {
            return `<span class="badge bg-success">Activo</span>`;
          }
        },
      },
      {
        title: 'Roles',
        data: 'roles',
        render: function (data) {
          return data && data.length ? data.join(', ') : '-';
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
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.roles = this.authService.currentUserValue?.roles!;

    this.isOnlyComprador =
      this.roles.length > 0 &&
      this.roles.every((role) => role.name === 'Comprador');

    // Agregar la columna "Comprador" solo si el usuario no es solo Comprador
    /*if (!this.isOnlyComprador) {
      this.datatableConfig.columns!.push({
        title: 'Comprador',
        data: 'buyerItBelongs.fullName',
        render: function (data) {
          return data ? data : '-';
        },
      });
    }*/

    this.loadBrokers();
  }

  loadBrokers(): void {
    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;

    const userObservable = this.userService.getAllUsers(true)

    const userSub = userObservable.subscribe({
      next: (data) => {
        this.users = data;
        this.datatableConfig = {
          ...this.datatableConfig,
          data: [...this.users],
        };

        this.cdr.detectChanges();
        this.reloadEvent.emit(true);
      },
      error: () => {
        this.showAlert({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información de usuarios.',
        });
      },
    });

    this.unsubscribe.push(userSub);
  }

  delete(id: string): void {
    const deleteSub = this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((item) => item.id !== id);
        this.reloadEvent.emit(true);
      },
      error: () => {
        this.showAlert({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el broker.',
        });
      },
    });
    this.unsubscribe.push(deleteSub);
  }

  originalBrokerModel: UserModel | null = null;
  originalPaymentInfoModel: IPaymentInfoModel | null = null;

  hasBrokerChanges(): boolean {
    return (
      JSON.stringify(this.userModel) !==
      JSON.stringify(this.originalBrokerModel)
    );
  }

  edit(id: string) {
    const currentUrl = this.router.url;
    this.router.navigate([`${currentUrl}/${id}`]);
  }

  create() {
    this.userModel = {} as IUpdateUserModel;
    //this.userModel.person = {} as IPersonModel;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(event: Event, myForm: NgForm) {
    /*
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.userModel.buyerItBelongs = this.authService.currentUserValue!.id;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Éxito!',
      text: this.userModel.id
        ? '¡Bróker actualizado exitosamente!'
        : '¡Bróker creado exitosamente!',
    };

    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: 'Hubo un problema al guardar los cambios.',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    const updateFn = () => {};

    const createFn = () => {
      this.userService.createUser(this.userModel).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.loadBrokers();
        },
        error: (error) => {
          errorAlert.text = 'No se pudo crear el bròker.';
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    if (this.userModel.id) {
      updateFn();
    } else {
      createFn();
    }*/
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
    this.reloadEvent.unsubscribe();
  }
}
