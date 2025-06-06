import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { style } from '@angular/animations';
import { UserService } from '../services/user.service';
import { AuthService, UserModel } from '../../auth';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss'],
})
export class CompaniesComponent implements OnInit, OnDestroy {
  user: UserModel | undefined;
  isLoading$: Observable<boolean>;

  photoUrl: string = '/assets/media/avatars/blank.png'; // Default photo URL

  private unsubscribe: Subscription[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoading$ = this.userService.isLoading$;
  }

  ngOnInit(): void {
    // Subscribe to the user observable
    const userSub = this.userService.user$.subscribe((user) => {
      this.user = user; // Update the user data
      this.cdr.detectChanges(); // Trigger Angular's change detection
    });
    this.unsubscribe.push(userSub);

    // Subscribe to the image observable for dynamic updates
    const imageSub = this.userService.image$.subscribe((imageUrl) => {
      this.photoUrl = imageUrl || '/assets/media/avatars/blank.png'; // Default avatar
      this.cdr.detectChanges(); // Trigger Angular's change detection
    });
    this.unsubscribe.push(imageSub);
  }

  onPhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.user) return;

    const formData = new FormData();
    formData.append('photo', file);

    this.userService.uploadPhoto(this.user.id, formData).subscribe({
      next: (updatedPhotoPath: string) => {
        this.user!.person.photo = updatedPhotoPath; // Update the user's photo path
      },
      error: (err) => {
        console.error('Upload failed', err);
      },
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
