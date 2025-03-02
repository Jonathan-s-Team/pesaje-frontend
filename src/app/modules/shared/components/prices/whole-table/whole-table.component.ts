import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SizeService } from '../../../services/size.service';
import { Observable, Subscription } from 'rxjs';
import {
  IReadSizeModel,
  SizeTypeEnum,
} from '../../../interfaces/size.interface';
import { IReadSizePriceModel } from '../../../interfaces/size-price.interface';
import { FormUtilsService } from 'src/app/utils/form-utils.service';

@Component({
  selector: 'app-whole-table',
  templateUrl: './whole-table.component.html',
})
export class WholeTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() sizePrices: IReadSizePriceModel[] = [];

  isLoading$: Observable<boolean>;

  form: FormGroup;

  sizes: IReadSizeModel[] = [];

  private unsubscribe: Subscription[] = [];

  constructor(
    private sizeService: SizeService,
    private formUtils: FormUtilsService
  ) {
    this.form = new FormGroup({});
    this.isLoading$ = this.sizeService.isLoading$;
  }

  ngOnInit(): void {
    this.loadSizes();
  }

  /**
   * 👉 Detects when `sizePrices` input changes and updates the form.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sizePrices'] && !changes['sizePrices'].firstChange) {
      this.updateFormControls();
    }
  }

  loadSizes(): void {
    const sizesSub = this.sizeService.getSizes(SizeTypeEnum.WHOLE).subscribe({
      next: (sizes) => {
        this.sizes = sizes;

        this.sizes.forEach((size) => {
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

  /**
   * 👉 Updates form controls based on `sizePrices` changes.
   */
  updateFormControls(): void {
    if (!this.sizePrices?.length) return;

    // ✅ Preserve existing values if possible
    const newFormControls: { [key: string]: FormControl } = {};
    this.sizePrices.forEach(({ size, price }) => {
      newFormControls[size.id] = new FormControl(price || '', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
      ]);
    });

    // ✅ Replace entire form group to avoid stale controls
    this.form = new FormGroup(newFormControls);
  }

  /**
   * 👉 Formats price input value
   */
  formatPrice(id: string) {
    const control = this.form.get(id);
    if (control) {
      this.formUtils.formatPrice(control); // ✅ Use utility function
    }
  }

  /**
   * 👉 Validates numeric input (prevents invalid characters)
   */
  validateNumber(event: KeyboardEvent) {
    this.formUtils.validateNumber(event); // ✅ Use utility function
  }

  /**
   * 👉 Triggers validation messages for all inputs
   */
  triggerValidation() {
    this.formUtils.triggerValidation(this.form); // ✅ Use utility function
  }

  /**
   * 👉 Clears validation errors and resets form state
   */
  clearValidationErrors() {
    this.formUtils.clearValidationErrors(this.form); // ✅ Use utility function
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
