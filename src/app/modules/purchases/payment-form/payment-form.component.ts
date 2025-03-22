import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { PurchasePaymentService } from '../../shared/services/purchase-payment.service';
import { PurchasePaymentMethodService } from '../../shared/services/payment-method.service';
import { ICreateUpdatePurchasePaymentModel } from '../../shared/interfaces/purchase-payment.interface';
import { IPurchasePaymentMethodModel } from '../../shared/interfaces/payment-method.interface';
import { FormUtilsService } from '../../../utils/form-utils.service';
import { InputUtilsService } from '../../../utils/input-utils.service';
import { AlertService } from 'src/app/utils/alert.service';

@Component({
  selector: 'app-payment-form',
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  @Input() purchaseId = '';
  @ViewChild('paymentForm') paymentForm!: NgForm;

  isLoading = false;
  purchasePaymentMethodList: IPurchasePaymentMethodModel[] = [];
  createPurchasePaymentModel: ICreateUpdatePurchasePaymentModel = {} as ICreateUpdatePurchasePaymentModel;

  constructor(
    public activeModal: NgbActiveModal,
    private purchasePaymentService: PurchasePaymentService,
    private purchasePaymentMethodService: PurchasePaymentMethodService,
    private formUtils: FormUtilsService,
    private inputUtils: InputUtilsService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadPurchasePaymentsMethods();
  }

  loadPurchasePaymentsMethods(): void {
    this.purchasePaymentMethodService.getAllPaymentsMethods().subscribe({
      next: (methods) => {
        this.purchasePaymentMethodList = methods;
      },
      error: (error) => {
        console.error('Error fetching payment methods:', error);
      }
    });
  }

  formatDecimal(controlName: string) {
    if (this.paymentForm && this.paymentForm.controls[controlName]) {
      this.formUtils.formatControlToDecimal(this.paymentForm.controls[controlName]);
    } else {
      const element = document.getElementById(controlName) as HTMLInputElement;
      if (element && element.value) {
        element.value = this.inputUtils.formatToDecimal(element.value);
      }
    }
  }

  validateNumber(event: KeyboardEvent) {
    this.inputUtils.validateNumber(event);
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isLoading = true;

    const paymentData = {
      ...this.createPurchasePaymentModel,
      amount: +this.createPurchasePaymentModel.amount,
      purchase: this.purchaseId
    };

    this.purchasePaymentService.createPurchasePayment(paymentData).subscribe({
      next: () => {
        this.alertService.showSuccessAlert({
          title: '¡Éxito!',
          text: 'Pago guardado correctamente'
        });
        this.isLoading = false;
        this.activeModal.close('saved');
      },
      error: (error) => {
        console.error('Error creating payment:', error);
        this.alertService.showErrorAlert({
          title: 'Error',
          error: 'No se pudo guardar el pago'
        });
        this.isLoading = false;
      }
    });
  }
}
