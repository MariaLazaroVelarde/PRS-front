import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DistributionProgram, DistributionProgramCreate, DistributionProgramUpdate } from '../models/water-distribution.model';
import { ApiResponse } from '../models/distribution.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramsService {

  private readonly apiPrograms = "https://probable-couscous-44x4945q6j7f7jr6-8080.app.github.dev/api/v2/programs"

  constructor(private http: HttpClient) { }

 // MÉTODOS DE PROGRAMS

  getAllPrograms(): Observable<DistributionProgram[]> {
    return this.http.get<ApiResponse<DistributionProgram[]>>(this.apiPrograms).pipe(
      map((response: { data: any; }) => response.data)
    );
  }

  getProgramById(id: string): Observable<DistributionProgram> {
    return this.http.get<ApiResponse<DistributionProgram>>(`${this.apiPrograms}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createProgram(program: DistributionProgramCreate): Observable<DistributionProgram> {
    return this.http.post<ApiResponse<DistributionProgram>>(this.apiPrograms, program).pipe(
      map(response => response.data)
    );
  }

  updateProgram(id: string, program: DistributionProgramUpdate): Observable<DistributionProgram> {
    return this.http.put<ApiResponse<DistributionProgram>>(`${this.apiPrograms}/${id}`, program).pipe(
      map(response => response.data)
    );
  }

  deleteProgram(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiPrograms}/${id}`).pipe(
      map(response => response.data)
    );
  }

  activateProgram(id: string): Observable<DistributionProgram> {
    return this.http.patch<ApiResponse<DistributionProgram>>(`${this.apiPrograms}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }

  deactivateProgram(id: string): Observable<DistributionProgram> {
    return this.http.patch<ApiResponse<DistributionProgram>>(`${this.apiPrograms}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }
}
