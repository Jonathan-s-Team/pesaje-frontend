import {environment} from "../../../../environments/environment";
import {Injectable} from "@angular/core";
import {BehaviorSubject, map, Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ICreateUpdateShrimpFarmModel, IReadShrimpFarmModel} from "../interfaces/shrimp-farm.interface";
import {finalize} from "rxjs/operators";

const API_SHRIMP_FARM_URL = `${environment.apiUrl}/shrimp-farm`;

@Injectable({ providedIn: 'root' })
export class ShrimpFarmService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  createShrimpFarm(
    farmData: Partial<ICreateUpdateShrimpFarmModel>
  ): Observable<{ message: string }> {
    this.isLoadingSubject.next(true);
    return this.http
      .post<{ message: string }>(`${API_SHRIMP_FARM_URL}`, farmData)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  updateShrimpFarm(
    shrimpFarmId: string,
    updateData: Partial<ICreateUpdateShrimpFarmModel>
  ): Observable<IReadShrimpFarmModel> {
    this.isLoadingSubject.next(true);
    return this.http
      .put<{ updatedFarm: IReadShrimpFarmModel }>(`${API_SHRIMP_FARM_URL}/${shrimpFarmId}`, updateData)
      .pipe(
        map(response => response.updatedFarm),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  deleteShrimpFarm(id: string): Observable<{ message: string }> {
    this.isLoadingSubject.next(true);
    return this.http
      .delete<{ message: string }>(`${API_SHRIMP_FARM_URL}/${id}`)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  getFarmsByClient(clientId: string): Observable<IReadShrimpFarmModel[]> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<{ ok: boolean; data: IReadShrimpFarmModel[] }>(`${API_SHRIMP_FARM_URL}?clientId=${clientId}`)
      .pipe(
        map(response => response.data || []),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  getFarmById(id: string): Observable<IReadShrimpFarmModel> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<{ ok: boolean; data: IReadShrimpFarmModel }>(`${API_SHRIMP_FARM_URL}/${id}`)
      .pipe(
        map(response => response.data),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  getAllFarms(includeDeleted: boolean): Observable<IReadShrimpFarmModel[]> {
    this.isLoadingSubject.next(true);
    return this.http
      .get<{ ok: boolean; data: IReadShrimpFarmModel[] }>(`${API_SHRIMP_FARM_URL}/all?includeDeleted=${includeDeleted}`)
      .pipe(
        map(response => response.data || []),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }
}
