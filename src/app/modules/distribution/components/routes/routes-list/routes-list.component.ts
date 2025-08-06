import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DistributionService } from '../../../../../core/services/distribution.service';
import { routes, Status } from '../../../../../core/models/distribution.model';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-routes-list',
  templateUrl: './routes-list.component.html',
  imports: [
    CommonModule,
    FormsModule,
  ]
})
export class RoutesListComponent implements OnInit {
  private router = inject(Router);
  private routesService = inject(DistributionService);

  allRoutes: routes[] = [];
  filteredRoutes: routes[] = [];
  users: any[] = []; // 
  organizations: any[] = []; //

  // Mapas para búsquedas rápidas
  private organizationMap = new Map<string, string>();
  private userMap = new Map<string, string>();

  // Filtros
  searchTerm: string = '';
  selectedStatus: 'activo' | 'inactivo' = 'activo';

  // Alertas
  showAlert: boolean = false;
  alertType: 'success' | 'error' | 'info' = 'success';
  alertMessage: string = '';
  loading: boolean = false;

  ngOnInit() {
    this.loadRoutes();
    this.loadOrganizations();
    this.loadUsers();
  }

  // Cargar rutas
  loadRoutes() {
    this.loading = true;
    this.routesService.getAllR().subscribe({
      next: (routes: routes[]) => {
        this.allRoutes = routes;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.showErrorAlert('Error al cargar las rutas.');
        this.loading = false;
      }
    });
  }

  loadOrganizations() {
    this.routesService.getAllOrganization().subscribe({
      next: (orgs: any[]) => {
        this.organizations = orgs; // guardas array
      },
      error: () => {
        this.showErrorAlert('Error al cargar organizaciones.');
      }
    });
  }

  loadUsers() {
    this.routesService.getAllUsers().subscribe({
      next: (users: any[]) => {
        this.users = users; // guardas array
      },
      error: () => {
        this.showErrorAlert('Error al cargar responsables.');
      }
    });
  }

  // Contadores
  getActiveRCount(): number {
    return this.allRoutes.filter(route => route.status === Status.ACTIVE).length;
  }

  getInactiveRCount(): number {
    return this.allRoutes.filter(route => route.status === Status.INACTIVE).length;
  }

  // Filtros
  onSearch() {
    this.applyFilters();
  }

  onStatusChange() {
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredRoutes = this.allRoutes.filter(route => {
      const matchesSearch = route.routeName.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'activo'
        ? route.status === Status.ACTIVE
        : route.status === Status.INACTIVE;
      return matchesSearch && matchesStatus;
    });
  }

  // Acciones
  addNewRoute(): void {
    this.router.navigate(['/distributions/routes/new']);
  }

  editRoute(routeId: string): void {
    this.router.navigate([`/distributions/routes/edit/${routeId}`]);
  }

  deactivateRoute(route: routes): void {
    const updatedRoute = { ...route, status: Status.INACTIVE };

    this.routesService.updateR(route.id, updatedRoute).subscribe({
      next: () => {
        route.status = Status.INACTIVE;
        this.showSuccessAlert('Ruta desactivada correctamente.');
        this.applyFilters();
      },
      error: () => {
        this.showErrorAlert('Error al desactivar la ruta.');
      }
    });
  }

  activateRoute(route: routes) {
    const updatedRoute = { ...route, status: Status.ACTIVE };

    this.routesService.updateR(route.id, updatedRoute).subscribe({
      next: (res) => {
        this.showSuccessAlert('Ruta activada correctamente.');
        this.loadRoutes(); // recarga la lista
      },
      error: () => this.showErrorAlert('Error al activar la ruta.')
    });
  }

  trackByRouteId(index: number, route: routes): string {
    return route.id;
  }

  getZoneNames(zones: any[]): string {
    return zones.map(zone => `Zona ${zone.order}`).join(', ');
  }

  // 🔹 Alertas
  dismissAlert() {
    this.showAlert = false;
  }

  showSuccessAlert(message: string) {
    this.alertType = 'success';
    this.alertMessage = message;
    this.showAlert = true;
  }

  showErrorAlert(message: string) {
    this.alertType = 'error';
    this.alertMessage = message;
    this.showAlert = true;
  }

  showInfoAlert(message: string) {
    this.alertType = 'info';
    this.alertMessage = message;
    this.showAlert = true;
  }

  // 🔹 Estados visuales
  getStatusClass(status: Status): string {
    return status === Status.ACTIVE
      ? 'text-green-700 bg-green-100'
      : 'text-red-700 bg-red-100';
  }

  getStatusLabel(status: Status): string {
    switch (status) {
      case Status.ACTIVE: return 'Activo';
      case Status.INACTIVE: return 'Inactivo';
      default: return 'Desconocido';
    }
  }

  getOrganizationName(organizationId: string): string {
    const org = this.organizations.find((o: any) => o.organizationId === organizationId);
    return org ? org.organizationName : organizationId;
  }

  getResponsibleName(responsibleUserId: string): string {
    const user = this.users.find((u: any) => u.id === responsibleUserId);
    return user ? user.name : responsibleUserId;
  }

}
