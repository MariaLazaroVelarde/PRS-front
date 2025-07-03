import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, UserCreate, UserUpdate } from '../models/user.model';
import { map, Observable, tap } from 'rxjs';

interface ApiResponse<T> {
  status: boolean,
  data: T
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Url de las apis organizations
  private api = "https://probable-couscous-44x4945q6j7f7jr6-8080.app.github.dev/api/v2/user";

  constructor(private http: HttpClient) { }

  getAll(): Observable<User[]> {
  return this.http.get<ApiResponse<User[]>>(this.api).pipe(
    map(response => response.data) // Extrae el array correctamente
  );
}

  getById(id: string) {
    return this.http.get<User>(`${this.api}/${id}`);
  }


  save(User: UserCreate): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.api, User).pipe(
      map(response => response.data)
    );
  }

  update(id: string, client: UserUpdate): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.api}/${id}`, client).pipe(
      map(response => response.data)
    );
  }


  desactivate(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.api}/${id}/desactivate`, {}).pipe(
      map(response => response.data)
    );
  }

  activate(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.api}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }

}
