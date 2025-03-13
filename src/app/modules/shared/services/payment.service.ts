import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {finalize} from "rxjs/operators";
import {environment} from "../../../../environments/environment";

const API_PAYMENT_URL = `${environment.apiUrl}/purchase-payment-method`;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  createPayment(
    paymentData: Partial<any>
  ): Observable<{ message: string }> {
    this.isLoadingSubject.next(true);
    return this.http
      .post<{ message: string }>(`${API_PAYMENT_URL}`, paymentData)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }
}
