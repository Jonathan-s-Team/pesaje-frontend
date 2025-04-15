import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { IEconomicReportModel } from '../interfaces/economic-report.interface';

const API_REPORT_URL = `${environment.apiUrl}/report`;

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEconomicReportByParams(
    includeDeleted: boolean,
    userId: string | null,
    periodId: string | null,
    clientId: string | null,
    controlNumber: string | null
  ): Observable<IEconomicReportModel> {
    this.isLoadingSubject.next(true);

    const params = new URLSearchParams();
    params.append('includeDeleted', includeDeleted.toString());
    if (userId) params.append('userId', userId);
    if (periodId) params.append('periodId', periodId);
    if (clientId) params.append('clientId', clientId);
    if (controlNumber !== null)
      params.append('controlNumber', controlNumber.toString());

    return this.http
      .get<{ ok: boolean; data: IEconomicReportModel }>(
        `${API_REPORT_URL}/economic/by-params?${params.toString()}`
      )
      .pipe(
        map((response) => response.data || []),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }
}
