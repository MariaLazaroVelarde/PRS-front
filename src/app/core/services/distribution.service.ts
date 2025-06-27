import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fares, faresCreate, faresUpdate, schedules, schedulesCreate, schedulesUpdate, routes, routesCreate, routesUpdate } from '../models/distribution.model';
import { map, Observable, tap } from 'rxjs';

interface ApiResponse<T> {
  status: boolean,
  data: T
}

@Injectable({
  providedIn: 'root'
})
export class DistributionService {

  // Url de las apis distributions
  private apiFares = "";
  private apiSchedules = "";
  private apiRoutes = ""

  constructor(private http: HttpClient) { }

  // MÉTODOS DE FARES
  getAllF() {
    return this.http.get<fares[]>(this.apiFares);
  }

  ggetAllActiveF(): Observable<fares[]> {
    return this.http.get<fares[]>(`${this.apiFares}/active`);
  }

  getAllInactiveF(): Observable<fares[]> {
    return this.http.get<fares[]>(`${this.apiFares}/inactive`);
  }

  getFById(id: string) {
    return this.http.get<fares>(`${this.apiFares}/${id}`);
  }

  createFares(fares: faresCreate): Observable<fares> {
    return this.http.post<ApiResponse<fares>>(this.apiFares, fares).pipe(
      map(response => response.data)
    );
  }

  updateFares(id: string, client: faresUpdate): Observable<fares> {
    return this.http.put<ApiResponse<fares>>(`${this.apiFares}/${id}`, client).pipe(
      map(response => response.data)
    );
  }


  deleteFares(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiFares}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }

  restoreFares(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiFares}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }


  // MÉTODOS DE SCHEDULES
  getAllS() {
    return this.http.get<schedules[]>(this.apiSchedules);
  }

  ggetAllActiveS(): Observable<schedules[]> {
    return this.http.get<schedules[]>(`${this.apiSchedules}/active`);
  }

  getAllInactiveS(): Observable<schedules[]> {
    return this.http.get<schedules[]>(`${this.apiSchedules}/inactive`);
  }

  getSById(id: string) {
    return this.http.get<schedules>(`${this.apiSchedules}/${id}`);
  }

  createSchedules(schedules: schedulesCreate): Observable<schedules> {
    return this.http.post<ApiResponse<schedules>>(this.apiSchedules, schedules).pipe(
      map(response => response.data)
    );
  }

  updateSchedules(id: string, client: schedulesUpdate): Observable<schedules> {
    return this.http.put<ApiResponse<schedules>>(`${this.apiSchedules}/${id}`, client).pipe(
      map(response => response.data)
    );
  }

  deleteSchedules(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiSchedules}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }

  restoreSchedules(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiSchedules}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }

   // MÉTODOS DE ROUTES
  getAllR() {
    return this.http.get<routes[]>(this.apiRoutes);
  }

  ggetAllActiveR(): Observable<routes[]> {
    return this.http.get<routes[]>(`${this.apiRoutes}/active`);
  }

  getAllInactiveR(): Observable<routes[]> {
    return this.http.get<routes[]>(`${this.apiRoutes}/inactive`);
  }

  getRById(id: string) {
    return this.http.get<routes>(`${this.apiRoutes}/${id}`);
  }

  createRoutes(routes: routesCreate): Observable<routes> {
    return this.http.post<ApiResponse<routes>>(this.apiRoutes, routes).pipe(
      map(response => response.data)
    );
  }

  updateRoutes(id: string, client: routesUpdate): Observable<routes> {
    return this.http.put<ApiResponse<routes>>(`${this.apiRoutes}/${id}`, client).pipe(
      map(response => response.data)
    );
  }

  deleteRoutes(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiRoutes}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }

  restoreRoutes(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiRoutes}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }

}
