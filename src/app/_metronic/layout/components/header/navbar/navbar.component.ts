import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { menuReinitialization } from 'src/app/_metronic/kt/kt-helpers';
import { AuthService, UserModel } from 'src/app/modules/auth';
import { UserService } from 'src/app/modules/settings/services/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, AfterViewInit {
  @Input() appHeaderDefaulMenuDisplay: boolean;
  @Input() isRtl: boolean;

  itemClass: string = 'ms-1 ms-lg-3';
  btnClass: string =
    'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
  userAvatarClass: string = 'symbol-35px symbol-md-40px';
  btnIconClass: string = 'fs-2 fs-md-1';

  user: UserModel | undefined;
  photoUrl: string = './assets/media/avatars/blank.png'; // Default avatar

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}
  ngAfterViewInit(): void {
    menuReinitialization();
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;

    if (currentUser?.id) {
      // Fetch user data by ID
      this.userService.getUserById(currentUser.id).subscribe({
        next: (user) => {
          this.user = user; // Update the user data
        },
        error: (err) => {
          console.error('Failed to fetch user data:', err);
        },
      });

      // Subscribe to the image observable for dynamic updates
      this.userService.image$.subscribe((imageUrl) => {
        this.photoUrl = imageUrl || './assets/media/avatars/blank.png'; // Default avatar
        this.cdr.detectChanges(); // Trigger change detection
      });
    } else {
      console.warn('No current user found.');
    }
  }
}
