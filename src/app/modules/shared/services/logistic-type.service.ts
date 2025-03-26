import {environment} from "../../../../environments/environment";
import {Injectable} from "@angular/core";
import {BehaviorSubject, map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ILogisticTypeModel, IReadLogisticTypeModel} from "../interfaces/logistic-type.interface";
import {finalize} from "rxjs/operators";

const API_PAYMENT_METHOD_URL = `${environment.apiUrl}/logistics-type`;

@Injectable({
  providedIn: 'root'
})
export class LogisticTypeService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  getAllLogisticsTypes(): Observable<ILogisticTypeModel[]> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<IReadLogisticTypeModel>(`${API_PAYMENT_METHOD_URL}`)
      .pipe(
        map((response) => response.data),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }
}
