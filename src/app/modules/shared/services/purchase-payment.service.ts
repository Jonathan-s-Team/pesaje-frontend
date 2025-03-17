import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {environment} from "../../../../environments/environment";
import {ICreateUpdatePurchasePaymentModel} from "../interfaces/purchase-payment.interface";

const API_PAYMENT_URL = `${environment.apiUrl}/purchase-payment-method`;

@Injectable({
  providedIn: 'root'
})
export class PurchasePaymentService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  createPurchasePayment(
    paymentData: Partial<ICreateUpdatePurchasePaymentModel>
  ): Observable<{ message: string }> {
    this.isLoadingSubject.next(true);
    return this.http
      .post<{ message: string }>(`${API_PAYMENT_URL}`, paymentData)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  getAllPurchasePayments(): Observable<ICreateUpdatePurchasePaymentModel[]> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<ICreateUpdatePurchasePaymentModel[]>(`${API_PAYMENT_URL}`)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }
}
