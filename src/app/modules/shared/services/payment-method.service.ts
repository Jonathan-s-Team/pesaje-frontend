import {environment} from "../../../../environments/environment";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {IPaymentInfoModel} from "../interfaces/payment-info.interface";
import {finalize, map} from "rxjs/operators";
import {IPurchasePaymentMethodModel, IReadPurchasePaymentMethodModel} from "../interfaces/payment-method.interface";

const API_PAYMENT_METHOD_URL = `${environment.apiUrl}/payment-method`;

@Injectable({
  providedIn: 'root'
})
export class PurchasePaymentMethodService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getAllPaymentsMethods(): Observable<IPurchasePaymentMethodModel[]> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<IReadPurchasePaymentMethodModel>(`${API_PAYMENT_METHOD_URL}`)
      .pipe(
        map((response) => response.data),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }
}
