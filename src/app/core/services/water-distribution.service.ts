import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { programs, programsCreate, programsUpdate } from '../models/water-distribution.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramsService {

  private readonly baseUrl = '/api/v2/programs'; // Cambia esta URL a la de tu backend

  constructor(private http: HttpClient) { }

  // Obtener todos los programas
  getAll(): Observable<programs[]> {
    return this.http.get<programs[]>(this.baseUrl);
  }

  // Obtener un programa por ID
  getById(id: string): Observable<programs> {
    return this.http.get<programs>(`${this.baseUrl}/${id}`);
  }

  // Crear un nuevo programa
  create(program: programsCreate): Observable<programs> {
    return this.http.post<programs>(this.baseUrl, program);
  }

  // Actualizar un programa existente
  update(id: string, program: programsUpdate): Observable<programs> {
    return this.http.put<programs>(`${this.baseUrl}/${id}`, program);
  }

  // Eliminar un programa
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Desactivar un programa
  deactivate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  // Activar un programa
  activate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/activate`, {});
  }

}