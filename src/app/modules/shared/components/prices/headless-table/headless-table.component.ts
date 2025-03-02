import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SizeService } from '../../../services/size.service';
import { Observable, Subscription } from 'rxjs';
import {
  IReadSizeModel,
  SizeTypeEnum,
} from '../../../interfaces/size.interface';
import { IReadSizePriceModel } from '../../../interfaces/size-price.interface';

@Component({
  selector: 'app-headless-table',
  templateUrl: './headless-table.component.html',
})
export class HeadlessTableComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;

  form: FormGroup;

  sizes: IReadSizeModel[] = [];
  uniqueSizes: IReadSizeModel[] = [];

  private unsubscribe: Subscription[] = [];

  constructor(private sizeService: SizeService) {
    this.form = new FormGroup({});
    this.isLoading$ = this.sizeService.isLoading$;
  }

  ngOnInit(): void {
    this.loadSizes();
  }

  loadSizes(): void {
    const sizesSub = this.sizeService
      .getSizes(
        [
          SizeTypeEnum['TAIL-A'],
          SizeTypeEnum['TAIL-A-'],
          SizeTypeEnum['TAIL-B'],
        ].join(',')
      )
      .subscribe({
        next: (sizes) => {
          // ✅ Remove duplicate sizes based on 'id'
          this.uniqueSizes = Array.from(
            new Map(sizes.map((item) => [item.size, item])).values()
          );

          this.sizes = sizes; // ✅ Only unique IDs remain

          this.sizes.forEach((size) => {
            // Add form controls with validation
            this.form.addControl(
              `cola-a-${size.id}`,
              new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d+(\.\d{1,2})?$/), // Allow only numbers with max 2 decimals
              ])
            );
            this.form.addControl(
              `cola-a--${size.id}`,
              new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d+(\.\d{1,2})?$/), // Allow only numbers with max 2 decimals
              ])
            );
            this.form.addControl(
              `cola-b-${size.id}`,
              new FormControl('', [
                Validators.required,
                Validators.pattern(/^\d+(\.\d{1,2})?$/), // Allow only numbers with max 2 decimals
              ])
            );
          });
        },
        error: (err) => {
          console.error('Error al cargar tallas', err);
        },
      });

    this.unsubscribe.push(sizesSub);
  }

  formatPrice(id: string) {
    let value = this.form.controls[id].value;

    // Ensure value is a number and format to 2 decimal places
    if (!isNaN(value) && value !== null && value !== '') {
      this.form.controls[id].setValue(parseFloat(value).toFixed(2));
    }
  }

  validateNumber(event: KeyboardEvent) {
    const pattern = /^[0-9.]$/;
    const inputChar = event.key;

    // Prevent input if not a number or dot
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  /**
   * 👉 This method marks all form controls as touched to show validation errors.
   */
  triggerValidation() {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.controls[key].markAsTouched();
    });
  }

  clearValidationErrors() {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.controls[key].setErrors(null); // Clear validation errors
      this.form.controls[key].markAsPristine(); // Mark as untouched
      this.form.controls[key].markAsUntouched();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
