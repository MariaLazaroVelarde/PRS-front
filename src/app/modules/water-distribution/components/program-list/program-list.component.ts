import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DistributionService } from '../../../../core/services/distribution.service';
import { DistributionProgram, ApiResponse, routes, schedules, User, ProgramStatus } from '../../../../core/models/distribution.model';

@Component({
  selector: 'app-program-list',
  templateUrl: './program-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProgramListComponent implements OnInit {
  programs: DistributionProgram[] = [];
  filteredPrograms: DistributionProgram[] = [];
  routes: routes[] = [];
  schedules: schedules[] = [];
  responsibleUsers: User[] = [];

  usersMap = new Map<string, string>();
  loading = false;
  showAlert = false;
  alertType: 'success' | 'error' | 'info' = 'info';
  alertMessage = '';
  searchTerm = '';
  selectedStatus = 'todos';

  constructor(
    private distributionService: DistributionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPrograms();
    this.loadRoutes();
    this.loadSchedules();
    this.loadResponsibleUsers();
    this.loadUsers();
  }

  private loadPrograms(): void {
    this.distributionService.getAllPrograms().subscribe({
      next: (programList: DistributionProgram[]) => {
        this.programs = programList;
        this.filteredPrograms = programList;
        this.loading = false;
      },
      error: (error: any) => this.handleError('Error al cargar los programas', error)
    });
  }

  private loadRoutes(): void {
    this.distributionService.getAllR().subscribe({
      next: (data: routes[]) => this.routes = data,
      error: (error: any) => console.error('Error al cargar rutas:', error)
    });
  }

  private loadSchedules(): void {
    this.distributionService.getAll().subscribe({
      next: (data: schedules[]) => this.schedules = data,
      error: (error: any) => console.error('Error al cargar horarios:', error)
    });
  }

  private loadUsers(): void {
    this.distributionService.getAllUsers().subscribe({
      next: (data: any[]) => {
        data.forEach(user => {
          this.usersMap.set(user.id, user.name || `${user.firstName} ${user.lastName}` || 'Nombre desconocido');
        });
      },
      error: (error: any) => console.error('Error al cargar usuarios:', error)
    });
  }

  loadResponsibleUsers(): void {
    this.distributionService.getResponsibleUsers().subscribe({
      next: (response: ApiResponse<User[]> | null) => {
        if (response && response.data) {
          this.responsibleUsers = response.data;
        } else {
          this.responsibleUsers = [];
        }
      },
      error: (error: any) => {
        console.error('Error cargando responsables', error);
        this.responsibleUsers = [];
      }
    });
  }

  getRouteName(routeId: string): string {
    const route = this.routes.find(r => r.id === routeId);
    return route ? route.routeName : `Ruta desconocida (${routeId})`;
  }

  getScheduleName(scheduleId: string): string {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    return schedule ? schedule.scheduleName : `Horario desconocido (${scheduleId})`;
  }

  getUserName(userId: string): string {
    return this.usersMap.get(userId) || `Usuario desconocido (${userId})`;
  }

  getResponsibleName(userId: string): string {
    const user = this.responsibleUsers.find(u => u.id === userId);
    return user ? (user.name || `${user.firstName} ${user.lastName}`) : '—';
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PLANNED': return 'PLANIFICADO';
      case 'IN_PROGRESS': return 'EN CURSO';
      case 'COMPLETED': return 'TERMINADO';
      case 'CANCELLED': return 'CANCELADO';
      default: return 'DESCONOCIDO';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PLANNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  onSearch(): void {
    this.filterPrograms();
  }

  onStatusChange(): void {
    this.filterPrograms();
  }

  private filterPrograms(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPrograms = this.programs.filter(program => {
      const matchesSearch = !term || program.programCode.toLowerCase().includes(term);
      const matchesStatus = this.selectedStatus === 'todos' || program.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

getAcceptableProgramsCount(): number {
  return this.programs.filter(p => p.status === ProgramStatus.COMPLETED).length;
}

getWarningProgramsCount(): number {
  return this.programs.filter(p => p.status === ProgramStatus.IN_PROGRESS).length;
}

getCriticalProgramsCount(): number {
  return this.programs.filter(p => p.status === ProgramStatus.CANCELLED).length;
}

  viewProgramsDetail(id: string): void {
    this.router.navigate(['/admin/distribution/programDetail', id]);
  }

  updatePrograms(id: string): void {
    this.router.navigate(['/admin/distribution/programEdit', id]);
  }

  addNewPrograms(): void {
    this.router.navigate(['/programs/new']);
  }

  trackByProgramsId(index: number, program: DistributionProgram): string {
    return program.id;
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

  private handleError(message: string, error: any): void {
    console.error('Error:', error);
    this.loading = false;
    this.showAlert = true;
    this.alertType = 'error';
    this.alertMessage = message;
  }
}
