import { Injectable } from '@angular/core';
import { PersonModel } from '../../../shared/models/person.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, finalize, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserModel } from '../../auth/models/user.model';
import { AuthService } from '../../auth';

const API_USERS_URL = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user$: Observable<UserModel | undefined>;
  private userSubject: BehaviorSubject<UserModel | undefined>;

  isLoading$: Observable<boolean>;
  private isLoadingSubject: BehaviorSubject<boolean>;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();

    this.userSubject = new BehaviorSubject<UserModel | undefined>(undefined);
    this.user$ = this.userSubject.asObservable();
  }

  get user(): UserModel | undefined {
    return this.userSubject.getValue();
  }

  set user(user: UserModel) {
    this.userSubject.next(user);
  }

  getUserById(id: string): Observable<UserModel> {
    this.isLoadingSubject.next(true);

    return this.http.get<UserModel>(`${API_USERS_URL}/${id}`).pipe(
      tap((user) => {
        this.userSubject.next(user); // Update stored user
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
