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
import { IRoleModel } from 'src/app/modules/auth/interfaces/role.interface';
import { IPersonModel } from 'src/app/modules/shared/interfaces/person.interface';
import { PERMISSION_ROUTES } from 'src/app/constants/routes.constants';
import {
  ICreateUserModel,
  IReadUsersModel,
} from 'src/app/modules/personal-profile/interfaces/user.interface';
import { UserService } from 'src/app/modules/personal-profile/services/user.service';
import { RoleService } from 'src/app/modules/shared/services/role.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-size-price',
  templateUrl: './size-price.component.html',
})
export class SizePriceComponent implements OnInit, AfterViewInit, OnDestroy {
  PERMISSION_ROUTES = PERMISSION_ROUTES;

  months = [
    { label: 'Enero', value: '01' },
    { label: 'Febrero', value: '02' },
    { label: 'Marzo', value: '03' },
    { label: 'Abril', value: '04' },
    { label: 'Mayo', value: '05' },
    { label: 'Junio', value: '06' },
    { label: 'Julio', value: '07' },
    { label: 'Agosto', value: '08' },
    { label: 'Septiembre', value: '09' },
    { label: 'Octubre', value: '10' },
    { label: 'Noviembre', value: '11' },
    { label: 'Diciembre', value: '12' },
  ];

  years: number[] = [];

  companies = ['Edpacific', 'Prodex']; // Load from service later

  selectedMonth = '';
  selectedYear = '';
  selectedCompany = '';

  isAdding = false;

  newMonth = '';
  newYear = '';
  newCompany = '';

  isLoading = false;

  roles: IRoleModel[];

  private unsubscribe: Subscription[] = [];

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  availableRoles: IRoleModel[] = [];
  selectedRoles: string[] = [];

  userModel: ICreateUserModel = {
    person: {} as IPersonModel,
    roles: [],
  } as ICreateUserModel;

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
        data: 'person',
        render: function (data, type, full) {
          const colorClasses = ['success', 'info', 'warning', 'danger'];
          const randomColorClass =
            colorClasses[Math.floor(Math.random() * colorClasses.length)];
          const initials =
            data && data.names.length > 0 && data.lastNames.length > 0
              ? `${data.names[0].toUpperCase()}${data.lastNames[0].toUpperCase()}`
              : '?';
          const symbolLabel = `
          <div class="symbol-label fs-3 bg-light-${randomColorClass} text-${randomColorClass}">
            ${initials}
          </div>
        `;

          const nameAndEmail = `
              <div class="d-flex flex-column" data-action="view" data-id="${
                full.id
              }">
                <div class="text-gray-800 text-hover-primary mb-1">${
                  data.names || 'Sin nombre'
                } ${data.lastNames || ''}</div>
                <span>${data.email || 'Sin correo'}</span>
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
        render: function (data: IRoleModel[]) {
          return data && data.length
            ? data.map((role) => role.name).join(', ')
            : '-';
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
    private router: Router,
    private cdr: ChangeDetectorRef,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.loadYears();
    this.loadCompanies();

    this.loadUsers();
    this.loadRoles();
  }

  ngAfterViewInit(): void {}

  loadUsers(): void {
    const userObservable = this.userService.getAllUsers(true);

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

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar roles', err);
      },
    });
  }

  onRoleChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const roleId = checkbox.value;
    if (checkbox.checked) {
      if (!this.selectedRoles.includes(roleId)) {
        this.selectedRoles.push(roleId);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter((r) => r !== roleId);
    }
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

  edit(id: string) {
    const currentUrl = this.router.url;
    this.router.navigate([`${currentUrl}/${id}`]);
  }

  create() {
    this.userModel = { person: {} as IPersonModel, roles: [] };
    this.selectedRoles = [];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const userPayload: ICreateUserModel = {
      username: this.userModel.username!,
      password: this.userModel.password!,
      roles: this.selectedRoles,
      person: this.userModel.person!,
    };

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Éxito!',
      text: '¡Usuario creado exitosamente!',
    };

    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: 'No se pudo crear el usuario.',
    };

    console.log(userPayload);
    this.userService.createUser(userPayload as any).subscribe({
      next: () => {
        this.showAlert(successAlert);
        this.loadUsers();
      },
      error: (error) => {
        errorAlert.text = 'No se pudo crear el usuario.';
        this.showAlert(errorAlert);
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
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

  loadYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  }

  loadCompanies() {
    // Simulate API call to get companies
    setTimeout(() => {
      this.companies = ['Edpacific', 'Prodex', 'Another Company'];
    }, 1000);
  }

  search() {
    console.log('Searching with:', {
      month: this.selectedMonth,
      year: this.selectedYear,
      company: this.selectedCompany,
    });
  }

  toggleAddPeriod() {
    this.isAdding = !this.isAdding;
    if (!this.isAdding) {
      // Reset form fields when canceling
      this.newMonth = '';
      this.newYear = '';
      this.newCompany = '';
    }
  }

  savePeriod() {
    console.log('Saving new period:', {
      month: this.newMonth,
      year: this.newYear,
      company: this.newCompany,
    });

    // Normally, you'd make an API call to save the record.
    this.toggleAddPeriod(); // Hide form after saving
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
    this.reloadEvent.unsubscribe();
  }
}
