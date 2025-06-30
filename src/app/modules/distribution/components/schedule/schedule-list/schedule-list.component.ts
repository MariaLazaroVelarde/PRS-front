import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DistributionService } from '../../../../../core/services/distribution.service';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { schedules, Status } from '../../../../../core/models/distribution.model';
import { organization, zones } from '../../../../../core/models/organization.model';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-list.component.html'
})

export class ScheduleListComponent implements OnInit {
  schedules: schedules[] = [];
  filteredSchedules: schedules[] = [];
  organizations: organization[] = [];
  zones: zones[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'activo';
  loading: boolean = false;
  showAlert: boolean = false;
  alertType: 'success' | 'error' | 'info' = 'success';
  alertMessage: string = '';

  constructor(
    private distributionService: DistributionService,
    private zonesService: OrganizationService,
    private organizationService: OrganizationService
  ) { }

  ngOnInit(): void {
    this.loadSchedules();
    this.loadOrganizations();
    this.loadZones();
  }

loadSchedules(): void {
  this.distributionService.getAll().subscribe({
    next: (data: schedules[]) => {
      if (Array.isArray(data)) {
        this.schedules = data;
      } else {
        console.warn('Formato inesperado al recibir schedules:', data);
        this.schedules = [];
      }
      this.applyFilters();
    },
    error: (err: any) => {
      console.error('Error al cargar horarios', err);
      this.schedules = [];
    }
  });
}



  loadOrganizations() {
    this.organizationService.getAllO().subscribe({
      next: (data) => {
        this.organizations = data.filter(o => o.status === 'ACTIVE');
      },
      error: (err) => {
        console.error('Error al cargar las organizaciones', err);
        Swal.fire('Error', 'No se pudieron cargar las organizaciones', 'error');
      }
    });
  }

  loadZones() {
    this.organizationService.getAllZ().subscribe({
      next: (data) => {
        this.zones = data.filter(z => z.status === 'ACTIVE');
      },
      error: (err) => {
        console.error('Error al cargar zonas', err);
        Swal.fire('Error', 'No se pudieron cargar las zonas', 'error');
      }
    });
  }

  private applyFilters(): void {
    this.filteredSchedules = this.schedules.filter(schedules => {
      // Filtro de búsqueda
      const matchesSearch = this.searchTerm === '' ||
        schedules.scheduleCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        schedules.scheduleName.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro de estado
      const matchesStatus = (this.selectedStatus === 'activo' && schedules.status === Status.ACTIVE) ||
        (this.selectedStatus === 'inactivo' && schedules.status === Status.INACTIVE);

      return matchesSearch && matchesStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  getStatusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Activo' : 'Inactivo';
  }

  deactivateSchedules(schedule: schedules): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la calle "${schedule.scheduleName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.distributionService.deactivateSchedules(schedule.scheduleId).subscribe({
          next: () => {
            const streetIndex = this.schedules.findIndex(s => s.scheduleId === schedule.scheduleId);
            if (streetIndex !== -1) {
              this.schedules[streetIndex].status = Status.INACTIVE;
            }
            this.applyFilters();
            this.showAlertMessage(`Horario ${schedule.scheduleName} eliminado correctamente`, 'success');
          },
          error: (error: any) => {
            console.error('Error al eliminar el horario:', error);
            this.showAlertMessage('Error al eliminar el horario', 'error');
          }
        });
      }
    });
  }

  activateSchedules(schedule: schedules): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas restaurar el horario "${schedule.scheduleName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.distributionService.activateSchedules(schedule.scheduleId).subscribe({
          next: () => {
            const streetIndex = this.schedules.findIndex(s => s.scheduleId === schedule.scheduleId);
            if (streetIndex !== -1) {
              this.schedules[streetIndex].status = Status.ACTIVE;
            }
            this.applyFilters();
            this.showAlertMessage(`Horario ${schedule.scheduleName} restaurado correctamente`, 'success');
          },
          error: (error: any) => {
            console.error('Error al restaurar el horario:', error);
            this.showAlertMessage('Error al restaurar el horario', 'error');
          }
        });
      }
    });
  }

  private showAlertMessage(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  editSchedule(id: string): void {
    console.log('Editar horario con ID:', id);
  }

  addNewSchedule(): void {
    console.log('Agregar nuevo horario');
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  }

  getNameZone(id: string): string {
    const zone = this.zones.find(z => z.zoneId === id);
    return zone ? zone.zoneName : 'Zona desconocida';
  }

  getNameOrganization(id: string): string {
    const org = this.organizations.find(o => o.organizationId === id);
    return org ? org.organizationName : 'Org. desconocida';
  }

  dismissAlert(): void {
    this.showAlert = false;
  }

  trackByScheduleId(index: number, item: schedules): string {
    return item.scheduleId;
  }

  getActiveSCount(): number {
    return this.schedules.filter(s => s.status === 'ACTIVE').length;
  }

  getInactiveSCount(): number {
    return this.schedules.filter(s => s.status === 'INACTIVE').length;
  }

}
