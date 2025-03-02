import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root', // ✅ Makes it available throughout the app
})
export class FormUtilsService {
  /**
   * 👉 Ensures value is properly formatted to 2 decimal places.
   */
  formatPrice(control: AbstractControl): void {
    if (!control || !control.value) return;

    const value = parseFloat(control.value);
    if (!isNaN(value)) {
      control.setValue(value.toFixed(2), { emitEvent: false });
    }
  }

  /**
   * 👉 Validates numeric input (allows numbers & decimal points).
   */
  validateNumber(event: KeyboardEvent): void {
    const pattern = /^[0-9.]$/;
    const inputChar = event.key;

    // Prevent input if not a number or dot
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  /**
   * 👉 Marks all form controls as touched to trigger validation messages.
   */
  triggerValidation(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      form.controls[key].markAsTouched();
    });
  }

  /**
   * 👉 Clears all validation errors and resets form state.
   */
  clearValidationErrors(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      form.controls[key].setErrors(null); // Clear validation errors
      form.controls[key].markAsPristine(); // Mark as pristine
      form.controls[key].markAsUntouched(); // Mark as untouched
    });
  }
}
