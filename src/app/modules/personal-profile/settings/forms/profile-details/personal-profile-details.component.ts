import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import {UserService} from "../../../services/user.service";
import {UserModel} from 'src/app/modules/auth';
import {ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import { UpdateUserInterface } from "../../../interface/UpdateUserInterface";

@Component({
  selector: 'app-personal-profile-details',
  templateUrl: './personal-profile-details.component.html',
})

export class PersonalProfileDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('profileForm') profileForm!: NgForm;
  user: UserModel | undefined = undefined;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];

  constructor(private cdr: ChangeDetectorRef, private userService: UserService) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    const userSub = this.userService.user$.subscribe(user => {
      this.user = user;
    });
    this.unsubscribe.push(userSub);
  }

  saveSettings() {
    if (this.profileForm.invalid || !this.user) {
      return;
    }

    this.isLoading$.next(true);

    const payload: UpdateUserInterface = {
      username: this.user.username,
      password: this.user.password,
      roles: this.user.roles?.map(role => role.id),
      person: {
        names: this.user.person.names,
        lastNames: this.user.person.lastNames,
        identification: this.user.person.identification,
        birthDate: this.user.person.birthDate.toString(),
        address: this.user.person.address,
        phone: this.user.person.phone?.toString() ?? '',
        mobilePhone: this.user.person.mobilePhone,
        mobilePhone2: this.user.person.mobilePhone2,
        email: this.user.person.email,
        emergencyContactName: this.user.person.emergencyContactName,
        emergencyContactPhone: this.user.person.emergencyContactPhone
      }
    };
    console.log(payload);
    setTimeout(() => {
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    }, 1500);

    /*this.userService.updateUser(this.user.id, payload).subscribe({
      next: (response) => {
        this.isLoading$.next(false);
        console.log('Usuario actualizado:', response);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading$.next(false);
        console.error('Error actualizando usuario:', error);
        this.cdr.detectChanges();
      }
    });*/
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
