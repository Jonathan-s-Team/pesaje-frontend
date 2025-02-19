import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const API_BROKER_URL = `${environment.apiUrl}/api/broker`;

interface IBroker {
  person: {
    photo: string;
    names: string;
    lastNames: string;
    identification: string;
    birthDate: string;
    address: string;
    phone: string;
    mobilePhone: string;
    mobilePhone2: string;
    email: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    id?: string;
  };
  buyerItBelongs: string;
}

@Injectable({ providedIn: 'root' })
export class BrokerService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isloading$ = this.isLoadingSubject.asObservable();
  constructor(private http: HttpClient) {}

  createBroker(brokerData: Partial<IBroker>): Observable<{ message: string }> {
    this.isLoadingSubject.next(true);
    return this.http
      .post<{ message: string }>(`${API_BROKER_URL}`, brokerData)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  getBrokersByUser(userId: string): Observable<IBroker[]> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<{ brokers: IBroker[] }>(`${API_BROKER_URL}?userId=${userId}`)
      .pipe(
        map((response) => response.brokers),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  getBrokerById(id: string): Observable<IBroker> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<{ broker: IBroker }>(`${API_BROKER_URL}/${id}`)
      .pipe(
        map((response) => response.broker),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  updateBroker(id: string, updateData: Partial<IBroker>): Observable<IBroker> {
    this.isLoadingSubject.next(true);
    return this.http
      .put<{ updatedBroker: IBroker }>(`${API_BROKER_URL}/${id}`, updateData)
      .pipe(
        map((response) => response.updatedBroker),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  deleteBroker(id: string): Observable<{ message: string }> {
    this.isLoadingSubject.next(true);
    return this.http
      .delete<{ message: string }>(`${API_BROKER_URL}/${id}`)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }
}
