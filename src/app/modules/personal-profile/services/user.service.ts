import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {BehaviorSubject, finalize, map, Observable, tap} from 'rxjs';
import {environment} from 'src/environments/environment';
import {UserModel} from '../../auth/models/user.model';
import {AuthService} from '../../auth';
import {ICreateUserModel, IReadUsersModel, IUpdateUserModel} from '../interfaces/user.interface';

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

  createUser(userData: ICreateUserModel): Observable<UserModel> {
    this.isLoadingSubject.next(true);
    return this.http.post<UserModel>(`${API_USERS_URL}`, userData).pipe(
      tap((newUser) => {
        this.userSubject.next(newUser);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateUser(id: string, userData: IUpdateUserModel): Observable<UserModel> {
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

  getAllUsers(includeDeleted: boolean, role?: string): Observable<IReadUsersModel[]> {
    this.isLoadingSubject.next(true);
    let params = new HttpParams().set('includeDeleted', includeDeleted.toString());
    if (role) {
      params = params.set('role', role);
    }
    return this.http
      .get<{ ok: boolean; users: IReadUsersModel[] }>(`${API_USERS_URL}/`, { params })
      .pipe(
        map((response) => response.users || []),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  deleteUser(id: string): Observable<{ message: string }> {
    this.isLoadingSubject.next(true);
    return this.http
      .delete<{ message: string }>(`${API_USERS_URL}/${id}`)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }
}
