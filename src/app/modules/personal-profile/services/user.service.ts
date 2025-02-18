import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, finalize, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserModel } from '../../auth/models/user.model';
import { AuthService } from '../../auth';
import { IUpdateUser } from '../interfaces/user.interface';

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

    return this.http.get<{ user: UserModel }>(`${API_USERS_URL}/${id}`).pipe(
      map((response) => response.user),
      tap((user) => {
        this.userSubject.next(user); // Update stored user
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // createUser(userData: Partial<UserModel>): Observable<UserModel> {
  //   this.isLoadingSubject.next(true);
  //   return this.http.post<UserModel>(`${API_USERS_URL}`, userData).pipe(
  //     tap((newUser) => {
  //       this.userSubject.next(newUser); // Update stored user
  //     }),
  //     finalize(() => this.isLoadingSubject.next(false))
  //   );
  // }

  updateUser(id: string, userData: IUpdateUser): Observable<UserModel> {
    this.isLoadingSubject.next(true);
    return this.http
      .put<{ updatedUser: UserModel }>(`${API_USERS_URL}/${id}`, userData)
      .pipe(
        map((response) => response.updatedUser),
        tap((updatedUser) => {
          this.userSubject.next(updatedUser); // Update stored user in UserService
          this.authService.currentUserValue = {
            id: updatedUser.id,
            username: updatedUser.username,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
          } as UserModel; // Update current user in AuthService
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }
}
