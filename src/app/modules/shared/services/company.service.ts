import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IReadCompanyModel } from '../interfaces/company.interface';

const API_PAYMENT_INFO_URL = `${environment.apiUrl}/company`;

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();
  constructor(private http: HttpClient) {}

  getCompanies(): Observable<IReadCompanyModel[]> {
    this.isLoadingSubject.next(true);

    return this.http
      .get<{ data: IReadCompanyModel[] }>(`${API_PAYMENT_INFO_URL}`)
      .pipe(
        map((response) => response.data || []),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }
}
