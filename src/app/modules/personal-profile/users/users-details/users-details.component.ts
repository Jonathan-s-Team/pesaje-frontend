import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BrokerService } from '../../services/broker.service';
import {
  IReadBrokerModel,
  IUpdateBrokerModel,
} from '../../interfaces/broker.interface';
import { NgForm } from '@angular/forms';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Observable, Subscription } from 'rxjs';
import {
  IReadUsersModel,
  IUpdateUserModel,
} from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

type Tabs = 'Details' | 'Payment Info';

@Component({
  selector: 'app-broker-details',
  templateUrl: './users-details.component.html',
})
export class UsersDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('userForm') userForm!: NgForm;

  isLoading$: Observable<boolean>;
  activeTab: Tabs = 'Details';

  userData: IReadUsersModel = {} as IReadUsersModel;
  personId: string;
  formattedBirthDate: string = '';

  private unsubscribe: Subscription[] = [];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.isLoading$ = this.userService.isLoading$;
  }

  ngOnInit(): void {
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

        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching user details:', err);
      },
    });

    this.unsubscribe.push(userSub);
  }

  setActiveTab(tab: Tabs) {
    this.activeTab = tab;
  }

  saveBroker() {
    if (this.userForm.invalid || !this.userForm) {
      return;
    }

    const payload: IUpdateUserModel = {
      id: this.userData.id,
      username: this.userData.username,
      // password: this.userData.password,
      person: this.userData.person,
      roles: this.userData.roles.map((role) => role.id),
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
