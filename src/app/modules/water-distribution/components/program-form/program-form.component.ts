import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DistributionService } from '../../../../core/services/distribution.service';
import { DistributionProgramCreate } from '../../../../core/models/distribution.model';

@Component({
  selector: 'app-program-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './program-form.component.html',
  styleUrl: './program-form.component.css'
})
export class ProgramFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(DistributionService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    organizationId: ['', Validators.required],
    programCode: ['', Validators.required],
    scheduleId: ['', Validators.required],
    routeId: ['', Validators.required],
    programDate: ['', Validators.required],
    plannedStartTime: ['', Validators.required],
    plannedEndTime: ['', Validators.required],
    actualStartTime: ['', Validators.required],
    actualEndTime: ['', Validators.required],
    status: ['ACTIVE', Validators.required], 
    responsibleUserId: ['', Validators.required],
    observations: ['']
  });

  organizations: Organization[] = []; //No se encuentra el nombre 'Organization'.ts(2304) type Organization = /*unresolved*/ any
  schedules: DistributionSchedule[] = []; //No se encuentra el nombre 'DistributionSchedule'.ts(2304) type DistributionSchedule = /*unresolved*/ any
  routes: DistributionRoute[] = [];
  responsibleUsers: User[] = [];

  loading: boolean = false;

  ngOnInit(): void {
    this.loadData();
    this.generateProgramCode();
  }

  loadData(): void {
    this.loading = true;

    Promise.all([
      this.service.getOrganizations().toPromise().then(data => {
        this.organizations = data.filter(o => o.status === 'ACTIVE');
      }),
      this.service.getSchedules().toPromise().then(data => {
        this.schedules = data.filter(s => s.status === 'ACTIVE');
      }),
      this.service.getRoutes().toPromise().then(data => {
        this.routes = data.filter(r => r.status === 'ACTIVE');
      }),
      this.service.getResponsibleUsers().toPromise().then(data => {
        this.responsibleUsers = data.filter(u => u.status === 'ACTIVE');
      }),
    ])
    .catch(err => {
      console.error('Error cargando datos:', err);
      Swal.fire('Error', 'No se pudieron cargar los datos de referencia', 'error');
    })
    .finally(() => {
      this.loading = false;
    });
  }

  generateProgramCode(): void {
    this.service.getAllPrograms().subscribe({
      next: programs => {
        const codes = programs
          .map(p => p.programCode)
          .filter(code => code?.startsWith('PROG'));

        const numbers = codes
          .map(code => parseInt(code.replace('PROG', ''), 10))
          .filter(n => !isNaN(n));

        const max = numbers.length > 0 ? Math.max(...numbers) : 0;
        const newCode = `PROG${String(max + 1).padStart(3, '0')}`;
        this.form.patchValue({ programCode: newCode });
      },
      error: err => {
        console.error('Error generando código de programa', err);
        Swal.fire('Error', 'No se pudo generar el código del programa', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const program = this.form.value as DistributionProgramCreate;

    this.loading = true;
    this.service.createProgram(program).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire('Éxito', 'Programa creado correctamente', 'success').then(() => {
          this.router.navigate(['/admin/distribution/programs']);
        });
      },
      error: err => {
        this.loading = false;
        console.error('Error al crear el programa:', err);
        Swal.fire('Error', 'No se pudo crear el programa', 'error');
      }
    });
  }

  cancel(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Los cambios no guardados se perderán',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.router.navigate(['/admin/distribution/programs']);
      }
    });
  }

  markFormGroupTouched(): void {
    Object.values(this.form.controls).forEach(control => control.markAsTouched());
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}