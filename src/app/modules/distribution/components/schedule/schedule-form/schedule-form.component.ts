import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { organization, zones } from '../../../../../core/models/organization.model';
import { OrganizationService } from '../../../../../core/services/organization.service';
import { DaysOfWeek, schedules, schedulesCreate, schedulesUpdate } from '../../../../../core/models/distribution.model';
import { DistributionService } from '../../../../../core/services/distribution.service';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.css'
})
export class ScheduleFormComponent implements OnInit {
  scheduleForm: FormGroup;
  isEditMode: boolean = false;
  scheduleId: string = '';
  loading: boolean = false;
  organizations: organization[] = [];
  zones: zones[] = [];
  private scheduleCode: string = '';

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private distributionService: DistributionService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.scheduleForm = this.fb.group({
      scheduleId: ['', Validators.required],
      streetName: ['', [Validators.required, Validators.minLength(3)]],
      DaysOfWeek: ['', [Validators.required, Validators.minLength(3)]],
      startTime: ['', [Validators.required, Validators.minLength(3)]],
      endTime: ['', [Validators.required, Validators.minLength(3)]],
      durationHours: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadZones();
    this.loadOrganizations();
    this.checkEditMode();
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

  loadOrganizations() {
    this.organizationService.getAllO().subscribe({
      next: (data) => {
        this.organizations = data.filter(o => o.status === 'ACTIVE');
      },
      error: (err) => {
        console.error('Error al cargar organizaciones', err);
        Swal.fire('Error', 'No se pudieron cargar las organizaciones', 'error');
      }
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.scheduleId = id;
      this.loadSchedule(id);
    }
  }

  loadSchedule(id: string) {
    this.loading = true;
    this.distributionService.getByIdS(id).subscribe({
      next: (schedule) => {
        this.scheduleCode = schedule.scheduleCode;
        this.scheduleForm.patchValue({
          scheduleId: schedule.scheduleId,
          scheduleName: schedule.scheduleName,
          daysOfWeek: schedule.daysOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          durationHours: schedule.durationHours
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar horarios', err);
        this.loading = false;
        Swal.fire('Error', 'No se pudo cargar los horarios', 'error');
        this.router.navigate(['/admin/distributions/schedule']);
      }
    });
  }

  onSubmit() {
    if (this.scheduleForm.valid) {
      this.loading = true;
      const formData = this.scheduleForm.value;

      if (this.isEditMode) {
        const updateData: schedulesUpdate = {
          scheduleCode: this.scheduleCode,
          scheduleName: formData.scheduleName,
          daysOfWeek: formData.daysOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          durationHours: formData.durationHours
        };
        this.distributionService.deactivateSchedules(this.scheduleId).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire('Éxito', 'Horario actualizado correctamente', 'success').then(() => {
              this.router.navigate(['/admin/distributions/schedule']);
            });
          },
          error: (err) => {
            console.error('Error al actualizar el horario', err);
            this.loading = false;
            Swal.fire('Error', 'No se pudo actualizar el horario', 'error');
          }
        });
      } else {
        const createData: schedulesCreate = {
          scheduleName: formData.scheduleName,
          daysOfWeek: formData.daysOfWeek,
          startTime: formData.startTime,
          endTime: formData.endTime,
          durationHours: formData.durationHours
        };
        this.distributionService.saveSchedules(createData).subscribe({
          next: () => {
            this.loading = false;
            Swal.fire('Éxito', 'Horario creado correctamente', 'success').then(() => {
              this.router.navigate(['/admin/distributions/schedule']);
            });
          },
          error: (err) => {
            console.error('Error al crear el horario', err);
            this.loading = false;
            Swal.fire('Error', 'No se pudo crear el horario', 'error');
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.scheduleForm.controls).forEach(key => {
      const control = this.scheduleForm.get(key);
      control?.markAsTouched();
    });
  }

  cancel() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Los cambios no guardados se perderán',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/admin/distributions/schedule']);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.scheduleForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.scheduleForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
