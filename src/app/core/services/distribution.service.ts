import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fares, faresCreate, faresUpdate, schedules, schedulesCreate, schedulesUpdate, routes } from '../models/distribution.model';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { organization, zones } from '../models/organization.model';
import { UserResponseDTO } from '../models/user.model';
import { ApiService } from './api.service';
import { AuthService } from '../auth/services/auth.service';

interface ApiResponse<T> {
  status: boolean,
  data: T
}

@Injectable({
  providedIn: 'root'
})

export class DistributionService {

  // Url de las apis distributions
  private apiFares = `${environment.distribution}/fare`;
  private apiSchedules = `${environment.distribution}/schedules`;
  private apiRoutes = `${environment.distribution}/routes`;

  private apiUrl = environment
  private apiService!: ApiService;
  private authService!: AuthService;

  constructor(private http: HttpClient) { }

  //MÉTODOS DE FARES

  getAllF(): Observable<fares[]> {
    return this.http.get<ApiResponse<fares[]>>(this.apiFares).pipe(
      map(response => response.data) // ✅ aquí ya devuelves solo el array
    );
  }

  getAllFares(): Observable<fares[]> {
    return this.getAllF();
  }

  getAllActiveF(): Observable<fares[]> {
    return this.http.get<ApiResponse<fares[]>>(`${this.apiFares}/active`).pipe(
      map(response => response.data)
    );
  }

  getAllInactiveF(): Observable<fares[]> {
    return this.http.get<ApiResponse<fares[]>>(`${this.apiFares}/inactive`).pipe(
      map(response => response.data)
    );
  }

  getByIdF(id: string): Observable<fares> {
    return this.http.get<ApiResponse<fares>>(`${this.apiFares}/${id}`).pipe(
      map(response => response.data)
    );
  }

  saveFares(fares: faresCreate): Observable<fares> {
    return this.http.post<ApiResponse<fares>>(this.apiFares, fares).pipe(
      map(response => response.data)
    );
  }

  updateFares(id: string, client: faresUpdate): Observable<fares> {
    return this.http.put<ApiResponse<fares>>(`${this.apiFares}/${id}`, client).pipe(
      map(response => response.data)
    );
  }

  deactivateFares(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiFares}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }

  activateFares(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiFares}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }


  // MÉTODOS DE SCHEDULES
  getAll(): Observable<schedules[]> {
    return this.http.get<ApiResponse<schedules[]>>(this.apiSchedules).pipe(
      map(res => res.data)
    );
  }

  getAllActiveS(): Observable<schedules[]> {
    return this.http.get<ApiResponse<schedules[]>>(`${this.apiSchedules}/active`).pipe(
      map(res => res.data)
    );
  }

  getAllInactiveS(): Observable<schedules[]> {
    return this.http.get<ApiResponse<schedules[]>>(`${this.apiSchedules}/inactive`).pipe(
      map(res => res.data)
    );
  }

  getByIdS(id: string): Observable<schedules> {
    return this.http.get<ApiResponse<schedules>>(`${this.apiSchedules}/${id}`).pipe(
      map(res => res.data)
    );
  }

  saveSchedules(schedules: schedulesCreate): Observable<schedules> {
    return this.http.post<ApiResponse<schedules>>(this.apiSchedules, schedules).pipe(
      map(response => response.data)
    );
  }

  updateSchedules(id: string, client: schedulesUpdate): Observable<schedules> {
    return this.http.put<ApiResponse<schedules>>(`${this.apiSchedules}/${id}`, client).pipe(
      map(response => response.data)
    );
  }

  deactivateSchedules(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiSchedules}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }

  activateSchedules(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiSchedules}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }


  // MÉTODOS DE ROUTES
  getAllR(): Observable<routes[]> {
    return this.http.get<ApiResponse<routes[]>>(this.apiRoutes).pipe(
      map(response => response.data)
    );
  }

  getAllActiveR(): Observable<routes[]> {
    return this.http.get<ApiResponse<routes[]>>(`${this.apiRoutes}/active`).pipe(
      map(response => response.data)
    );
  }

  getAllInactiveR(): Observable<routes[]> {
    return this.http.get<ApiResponse<routes[]>>(`${this.apiRoutes}/inactive`).pipe(
      map(response => response.data)
    );
  }

  getByIdR(id: string): Observable<routes> {
    return this.http.get<ApiResponse<routes>>(`${this.apiRoutes}/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateR(id: string, route: routes): Observable<routes> {
    return this.http.put<ApiResponse<routes>>(`${this.apiRoutes}/${id}`, route).pipe(
      map(response => response.data)
    );
  }

  // ZONES (pendiente)
  getAllZones() {
    return this.http.get<ApiResponse<zones[]>>(this.apiUrl.zonas).pipe(
      map(response => response.data)
    );
  }

  getAllOrganization() {
    return this.http.get<ApiResponse<organization[]>>(this.apiUrl.organizations).pipe(
      map(response => response.data)
    );
  }

  getAllUsers(): Observable<UserResponseDTO[]> {
    const organizationId = this.authService.getCurrentOrganizationId();
    if (!organizationId) {
      throw new Error('No se encontró ID de organización');
    }

    return this.apiService.get<UserResponseDTO[]>(`/users/organization/${organizationId}`);
  }
}
