import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { organization, organizationCreate, organizationUpdate, zones, zonesCreate, zonesUpdate } from '../models/organization.model';
import { map, Observable, tap } from 'rxjs';

interface ApiResponse<T> {
  status: boolean,
    data: T
    }

    @Injectable({
      providedIn: 'root'
      })
      export class OrganizationService {
        // Url de las apis organizations
          private apiOrg = "https://orange-palm-tree-x6r7x9569qr367wq-8080.app.github.dev/api/v2/organizations";
            private apiZon = "https://orange-palm-tree-x6r7x9569qr367wq-8080.app.github.dev/api/v2/zones";

              constructor(private http: HttpClient) { }

                getAllO() {
                    return this.http.get<organization[]>(this.apiOrg);
                      }

                        getByIdO(id: string) {
                            return this.http.get<organization>(`${this.apiOrg}/${id}`);
                              }


                                saveO(organization: organizationCreate): Observable<organization> {
                                    return this.http.post<ApiResponse<organization>>(this.apiOrg, organization).pipe(
                                          map(response => response.data)
                                              );
                                                }

                                                  updateO(id: string, client: organizationUpdate): Observable<organization> {
                                                      return this.http.put<ApiResponse<organization>>(`${this.apiOrg}/${id}`, client).pipe(
                                                            map(response => response.data)
                                                                );
                                                                  }


                                                                    desactivateO(id: string): Observable<void> {
                                                                        return this.http.patch<ApiResponse<void>>(`${this.apiOrg}/${id}/desactivate`, {}).pipe(
                                                                              map(response => response.data)
                                                                                  );
                                                                                    }

                                                                                      activateO(id: string): Observable<void> {
                                                                                          return this.http.patch<ApiResponse<void>>(`${this.apiOrg}/${id}/activate`, {}).pipe(
                                                                                                map(response => response.data)
                                                                                                    );
                                                                                                      }

                                                                                                        // Metode zones 

                                                                                                          getAllZ() {
                                                                                                              return this.http.get<zones[]>(this.apiZon);
                                                                                                                }

                                                                                                                  getByIdZ(id: string) {
                                                                                                                      return this.http.get<zones>(`${this.apiZon}/${id}`);
                                                                                                                        }

                                                                                                                          saveZ(zone: zonesCreate): Observable<zones> {
                                                                                                                              return this.http.post<ApiResponse<zones>>(this.apiZon, zone).pipe(
                                                                                                                                    map(response => response.data)
                                                                                                                                        );
                                                                                                                                          }

                                                                                                                                            updateZ(id: string, zone: zonesUpdate): Observable<zones> {
                                                                                                                                                return this.http.put<ApiResponse<zones>>(`${this.apiZon}/${id}`, zone).pipe(
                                                                                                                                                      map(response => response.data)
                                                                                                                                                          );
                                                                                                                                                            }

                                                                                                                                                              desactivateZ(id: string): Observable<void> {
                                                                                                                                                                  return this.http.patch<ApiResponse<void>>(`${this.apiZon}/${id}/desactivate`, {}).pipe(
                                                                                                                                                                        map(response => response.data)
                                                                                                                                                                            );
                                                                                                                                                                              }

                                                                                                                                                                                activateZ(id: string): Observable<void> {
                                                                                                                                                                                    return this.http.patch<ApiResponse<void>>(`${this.apiZon}/${id}/activate`, {}).pipe(
                                                                                                                                                                                          map(response => response.data)
                                                                                                                                                                                              );
                                                                                                                                                                                                }

                                                                                                                                                                                                }
