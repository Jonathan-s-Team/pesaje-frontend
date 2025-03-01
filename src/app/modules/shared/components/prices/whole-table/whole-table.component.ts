import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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

          // ✅ Add control to FormGroup (before rendering)
          this.form.addControl(size.id, new FormControl(0));
        });
      },
      error: (err) => {
        console.error('Error al cargar tallas', err);
      },
    });

    this.unsubscribe.push(sizesSub);
  }

  formatPrice(id: string) {
    const value = parseFloat(this.form.controls[id].value).toFixed(2);
    this.form.controls[id].setValue(value);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
