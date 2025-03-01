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
  selector: 'app-whole-table',
  templateUrl: './whole-table.component.html',
})
export class WholeTableComponent implements OnInit, OnDestroy {
  isLoading$: Observable<boolean>;

  form: FormGroup;

  sizes: IReadSizeModel[] = [];

  sizePrices: IReadSizePriceModel[] = [];

  private unsubscribe: Subscription[] = [];

  constructor(private sizeService: SizeService) {
    this.form = new FormGroup({});
    this.isLoading$ = this.sizeService.isLoading$;
  }

  ngOnInit(): void {
    this.loadSizes();

    this.sizePrices.forEach((item) => {
      this.form.addControl(item.size.id, new FormControl(item.price));
    });
  }

  loadSizes(): void {
    const sizesSub = this.sizeService.getSizes(SizeTypeEnum.WHOLE).subscribe({
      next: (sizes) => {
        this.sizes = sizes;

        this.sizes.forEach((size) => {
          // Add size price to array
          this.sizePrices.push({ size, price: 0 });

          // Add form controls with validation
          this.form.addControl(
            size.id,
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

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
