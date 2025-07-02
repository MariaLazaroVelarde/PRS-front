import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { programs } from '../../../../core/models/water-distribution.model';
import { routes, schedules } from '../../../../core/models/distribution.model';
import { ProgramsService } from '../../../../core/services/water-distribution.service';
import { DistributionService } from '../../../../core/services/distribution.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-program-list',
  templateUrl: './program-list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})

export class ProgramListComponent implements OnInit {
  programs: programs[] = [];
  filteredPrograms: programs[] = [];
  routes: routes[] = [];
  schedules: schedules[] = [];
  loading = false;
  showAlert = false;
  alertType: 'success' | 'error' | 'info' = 'info';
  alertMessage = '';
  searchTerm = '';
  selectedStatus = 'todos';

  constructor(
    private programsService: ProgramsService,
    private distributionService: DistributionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPrograms();
    this.loadRoutes();
    this.loadSchedules();
  }

  private loadPrograms(): void {
    this.loading = true;
    this.programsService.getAll().subscribe({
      next: (programList) => {
        this.programs = programList;
        this.filteredPrograms = programList;
        this.loading = false;
      },
      error: (error) => {
        this.handleError('Error al cargar los programas', error);
        this.loading = false;
      }
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
  
  onSearch(): void {
    this.filterPrograms();
  }

  onStatusChange(): void {
    this.filterPrograms();
  }

  private filterPrograms(): void {
    this.filteredPrograms = this.programs.filter(program => {
      const matchesSearch = !this.searchTerm ||
        program.programCode.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus === 'todos' ||
        program.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  getAcceptableProgramsCount(): number {
    return this.programs.filter(p => p.status === 'COMPLETED').length;
  }

  getWarningProgramsCount(): number {
    return this.programs.filter(p => p.status === 'IN_PROGRESS').length;
  }

  getCriticalProgramsCount(): number {
    return this.programs.filter(p => p.status === 'CANCELLED').length;
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

  viewProgramsDetail(id: string): void {
    this.router.navigate(['/admin/distribution/programDetail', id]);
  }

  updatePrograms(id: string): void {
    this.router.navigate(['/admin/distribution/programEdit', id]);
  }

  addNewPrograms(): void {
    this.router.navigate(['/admin/distribution/programNew']);
  }

  trackByProgramsId(index: number, program: programs): string {
    return program.id;
  }

  getRouteName(routeId: string): string {
    const route = this.routes.find(r => r.routeId === routeId);
    return route ? route.routeName : routeId;
  }

  getScheduleName(scheduleId: string): string {
    const schedule = this.schedules.find(s => s.scheduleId === scheduleId);
    return schedule ? schedule.scheduleName : scheduleId;
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

  private handleError(message: string, error: any): void {
    console.error('Error:', error);
    this.showAlert = true;
    this.alertType = 'error';
    this.alertMessage = message;
  }

}
