import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Observable, Subscription } from 'rxjs';
import {
  IReadUsersModel,
  IUpdateUserModel,
} from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { IRoleModel } from 'src/app/modules/auth/interfaces/role.interface';
import { RoleService } from 'src/app/modules/shared/services/role.service';
import { PERMISSION_ROUTES } from '../../../../constants/routes.constants';

type Tabs = 'Details' | 'Payment Info';

@Component({
  selector: 'app-user-details',
  templateUrl: './users-details.component.html',
})
export class UsersDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  PERMISSION_ROUTE = PERMISSION_ROUTES.PERSONAL_PROFILE.USERS;

  @ViewChild('userForm') userForm!: NgForm;

  isLoading$: Observable<boolean>;
  activeTab: Tabs = 'Details';

  userData: IReadUsersModel = {} as IReadUsersModel;
  personId: string;
  formattedBirthDate: string = '';

  availableRoles: IRoleModel[] = [];
  selectedRoles: string[] = [];

  private unsubscribe: Subscription[] = [];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private roleService: RoleService
  ) {
    this.isLoading$ = this.userService.isLoading$;
  }

  ngOnInit(): void {
    this.loadRoles();
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('userId');
      if (userId) {
        this.fetchUserDetails(userId);
      }
    });
  }

  ngAfterViewInit(): void {}

  fetchUserDetails(userId: string): void {
    const userSub = this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.userData = {
          id: user.id,
          username: user.username,
          person: user.person,
          roles: user.roles,
          deletedAt: user.deletedAt,
        };
        this.personId = user.person?.id ?? '';

        if (this.userData.person?.birthDate) {
          this.formattedBirthDate = new Date(this.userData.person.birthDate)
            .toISOString()
            .split('T')[0];
        }
        this.selectedRoles = this.userData.roles
          ? this.userData.roles.map((role) => role.id)
          : [];

        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
      },
    });

    this.unsubscribe.push(userSub);
  }

  loadRoles(): void {
    const rolesSub = this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar roles', err);
      },
    });
    this.unsubscribe.push(rolesSub);
  }

  setActiveTab(tab: Tabs) {
    this.activeTab = tab;
  }

  saveUser(): void {
    if (!this.userForm || this.userForm.invalid) {
      return;
    }

    const payload: IUpdateUserModel = {
      id: this.userData.id,
      username: this.userData.username,
      person: this.userData.person,
      roles: this.selectedRoles,
    };

    const updateSub = this.userService
      .updateUser(this.userData.id, payload)
      .subscribe({
        next: () => {
          this.showSuccessAlert();
        },
        error: (error) => {
          console.error('Error updating user', error);
          this.showErrorAlert(error);
        },
      });
    this.unsubscribe.push(updateSub);
  }

  onRoleChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const roleId = checkbox.value;
    if (checkbox.checked) {
      if (!this.selectedRoles.includes(roleId)) {
        this.selectedRoles.push(roleId);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter((id) => id !== roleId);
    }
  }

  goBack(): void {
    this.router.navigate(['personal-profile', 'users']);
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
      html: `<strong>${
        error.message || 'Ocurrió un error inesperado.'
      }</strong>`,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33',
      showCloseButton: true,
      focusConfirm: false,
    };
    Swal.fire(options);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
