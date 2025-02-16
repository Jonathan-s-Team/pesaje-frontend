import { Component } from '@angular/core';

@Component({
  selector: 'app-personal-deactivate-account',
  templateUrl: './personal-deactivate-account.component.html',
})
export class PersonalDeactivateAccountComponent {
  constructor() {}

  saveSettings() {
    alert('La cuenta fue bloqueada satisfactoriamente!');
  }
}
