import { Component } from '@angular/core';

@Component({
  selector: 'app-personal-deactivate-account',
  templateUrl: './personal-deactivate-account.component.html',
})
export class PersonalDeactivateAccountComponent {
  constructor() {}

  saveSettings() {
    alert('Account has been successfully deleted!');
  }
}
