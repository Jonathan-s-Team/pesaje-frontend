import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, finalize, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserModel } from '../../auth/models/user.model';
import { AuthService } from '../../auth';
import {
  ICreateUserModel,
  IReadUserModel,
  IUpdateUserModel,
} from '../interfaces/user.interface';

const API_USERS_URL = `${environment.apiUrl}/user`;
const UPLOADS_URL = `${environment.uploadsUrl}`;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user$: Observable<UserModel | undefined>;
  private userSubject: BehaviorSubject<UserModel | undefined>;

  isLoading$: Observable<boolean>;
  private isLoadingSubject: BehaviorSubject<boolean>;

  image$: Observable<string | undefined>;
  private imageSubject: BehaviorSubject<string | undefined>;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();

    this.userSubject = new BehaviorSubject<UserModel | undefined>(undefined);
    this.user$ = this.userSubject.asObservable();

    this.imageSubject = new BehaviorSubject<string | undefined>(undefined);
    this.image$ = this.imageSubject.asObservable();
  }

  get user(): UserModel | undefined {
    return this.userSubject.getValue();
  }

  set user(user: UserModel) {
    this.userSubject.next(user);
  }

  get image(): string | undefined {
    return this.imageSubject.getValue();
  }

  setImage(photoPath: string | undefined): void {
    if (photoPath) {
      this.getSecurePhoto(photoPath).subscribe({
        next: (blob) => {
          // Revoke the previous object URL if it exists
          const currentImageUrl = this.imageSubject.getValue();
          if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(currentImageUrl);
          }

          // Create a new Blob URL and update the subject
          const blobUrl = URL.createObjectURL(blob);
          this.imageSubject.next(blobUrl);
        },
        error: () => {
          console.error('Failed to load photo, using default.');
          this.imageSubject.next('./assets/media/avatars/blank.png'); // Fallback to default
        },
      });
    } else {
      // Fallback to the default photo
      this.imageSubject.next('./assets/media/avatars/blank.png');
    }
  }

  getUserById(id: string): Observable<UserModel> {
    this.isLoadingSubject.next(true);

    return this.http.get<{ user: UserModel }>(`${API_USERS_URL}/${id}`).pipe(
      map((response) => response.user),
      tap((user) => {
        this.userSubject.next(user); // Update stored user
        this.setImage(user.person?.photo); // Set the user's photo
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

  updatePassword(id: string, newPassword: string): Observable<UserModel> {
    this.isLoadingSubject.next(true);
    return this.http
      .put<{ updatedUser: UserModel }>(`${API_USERS_URL}/${id}/password`, {
        password: newPassword,
      })
      .pipe(
        map((response) => response.updatedUser),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  getAllUsers(
    includeDeleted: boolean,
    role?: string
  ): Observable<IReadUserModel[]> {
    this.isLoadingSubject.next(true);
    let params = new HttpParams().set(
      'includeDeleted',
      includeDeleted.toString()
    );
    if (role) {
      params = params.set('role', role);
    }
    return this.http
      .get<{ ok: boolean; users: IReadUserModel[] }>(`${API_USERS_URL}/`, {
        params,
      })
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

  getSecurePhoto(photoPath: string): Observable<Blob> {
    return this.http.get(`${UPLOADS_URL}${photoPath}`, {
      responseType: 'blob',
    });
  }

  uploadPhoto(userId: string, formData: FormData): Observable<string> {
    this.isLoadingSubject.next(true);
    return this.http
      .put<{ data: any }>(`${API_USERS_URL}/${userId}/photo`, formData)
      .pipe(
        map((res) => res.data.photo),
        tap((updatedPhotoPath) => {
          // Update the imageSubject with the new photo
          this.setImage(updatedPhotoPath);
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }
}
