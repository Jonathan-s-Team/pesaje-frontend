import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {ICreateLogisticModel, ILogisticResponse, IReadLogisticModel} from "../interfaces/logistic.interface";
import {BehaviorSubject, map, Observable} from "rxjs";
import {finalize} from "rxjs/operators";

const API_PURCHASE_URL = `${environment.apiUrl}/logistics`;

@Injectable({
  providedIn: 'root'
})
export class LogisticService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private http: HttpClient) { }

  createLogistic(payload: ICreateLogisticModel) :Observable<IReadLogisticModel> {
    this.isLoadingSubject.next(true);

    return this.http
      .post<ILogisticResponse>(API_PURCHASE_URL, payload)
      .pipe(
        map(res => res.data),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }
}
