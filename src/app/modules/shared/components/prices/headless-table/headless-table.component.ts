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
  selector: 'app-headless-table',
  templateUrl: './headless-table.component.html',
})
export class HeadlessTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() sizePrices: IReadSizePriceModel[] = [];

  isLoading$: Observable<boolean>;

  form: FormGroup;

  sizes: IReadSizeModel[] = [];
  uniqueSizes: IReadSizeModel[] = [];

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

  /**
   * 👉 Updates form controls dynamically when `sizePrices` changes.
   */
  updateFormControls(): void {
    if (!this.sizePrices?.length) return;

    // ✅ Preserve existing values if possible
    const newFormControls: { [key: string]: FormControl } = {};
    this.sizePrices.forEach(({ size, price }) => {
      this.ensureFormControlExists(newFormControls, `cola-a-${size.id}`, price);
      this.ensureFormControlExists(
        newFormControls,
        `cola-a--${size.id}`,
        price
      );
      this.ensureFormControlExists(newFormControls, `cola-b-${size.id}`, price);
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

  /**
   * 👉 Ensures a form control exists and updates its value.
   */
  private ensureFormControlExists(
    controls: { [key: string]: FormControl },
    controlName: string,
    value: number
  ): void {
    controls[controlName] = new FormControl(value || '', [
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?$/), // Allow only numbers with max 2 decimals
    ]);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((sub) => sub.unsubscribe());
  }
}
